"use client";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpeg: FFmpeg | null = null;
let loadingPromise: Promise<FFmpeg> | null = null;

/* =========================================
   Load FFmpeg
========================================= */

async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpeg) {
    return ffmpeg;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    const instance = new FFmpeg();

    const baseURL =
      "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd";

    await instance.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),

      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm",
      ),
    });

    ffmpeg = instance;

    return instance;
  })();

  try {
    return await loadingPromise;
  } catch (error) {
    loadingPromise = null;
    throw error;
  }
}

/* =========================================
   Preload FFmpeg
========================================= */

export function preloadFFmpeg(): void {
  void getFFmpeg().catch((error) => {
    console.error(
      "FFmpeg preload failed:",
      error,
    );
  });
}

/* =========================================
   Get Video Duration
   Browser metadata only
========================================= */

function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");

    const url = URL.createObjectURL(file);

    video.preload = "metadata";

    video.onloadedmetadata = () => {
      const duration = video.duration;

      URL.revokeObjectURL(url);

      if (!Number.isFinite(duration) || duration <= 0) {
        reject(new Error("Could not determine video duration."));

        return;
      }

      resolve(duration);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);

      reject(new Error("Could not read video metadata."));
    };

    video.src = url;
  });
}

/* =========================================
   Compress Video
========================================= */

export async function compressVideo(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<File> {
  /* =======================================
     Direct Upload
  ======================================= */

  const DIRECT_UPLOAD_LIMIT = 8 * 1024 * 1024;

  if (file.size <= DIRECT_UPLOAD_LIMIT) {
    onProgress?.(100);

    return file;
  }

  /* =======================================
     Maximum Normal User Video
  ======================================= */

  const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

  if (file.size > MAX_VIDEO_SIZE) {
    throw new Error("Video must be less than 50 MB.");
  }

  /* =======================================
     Get Duration

     No FFmpeg processing here.
  ======================================= */

  onProgress?.(2);

  const duration = await getVideoDuration(file);

  /* =======================================
     Load FFmpeg
  ======================================= */

  onProgress?.(5);

  const instance = await getFFmpeg();

  const timestamp = Date.now();

  const inputName = `input-${timestamp}.${getExtension(file.name)}`;

  const outputName = `compressed-${timestamp}.mp4`;

  /* =======================================
     Progress
  ======================================= */

  const progressHandler = ({ progress }: { progress: number }) => {
    /*
      FFmpeg progress represents the
      encoding stage.

      Reserve first 5% for setup.
    */

    const percentage = 5 + Math.round(Math.min(1, Math.max(0, progress)) * 90);

    onProgress?.(Math.min(95, percentage));
  };

  instance.on("progress", progressHandler);

  try {
    /* =====================================
       Write Original Video
    ===================================== */

    await instance.writeFile(inputName, await fetchFile(file));

    /* =====================================
       Target Size
    ===================================== */

    const TARGET_SIZE_MB = 10;

    const TARGET_SIZE_BYTES = TARGET_SIZE_MB * 1024 * 1024;

    /* =====================================
       Audio Bitrate
    ===================================== */

    const AUDIO_BITRATE = 64 * 1000;

    /* =====================================
       Calculate Target Bitrate

       Total bitrate =
       file size / duration
    ===================================== */

    const totalBitrate = (TARGET_SIZE_BYTES * 8) / duration;

    let videoBitrate = Math.floor(totalBitrate - AUDIO_BITRATE);

    /*
      Keep a minimum bitrate so that
      very long videos do not become
      unusably blurry.
    */

    videoBitrate = Math.max(150_000, videoBitrate);

    /*
      Keep a reasonable maximum bitrate.
    */

    videoBitrate = Math.min(2_500_000, videoBitrate);

    /* =====================================
       Compress

       Only ONE FFmpeg encode.
    ===================================== */

    const exitCode = await instance.exec([
      "-i",
      inputName,

      "-vf",
      "scale='min(720,iw)':-2",

      "-r",
      "24",

      "-c:v",
      "libx264",

      "-preset",
      "ultrafast",

      "-b:v",
      `${videoBitrate}`,

      "-maxrate",
      `${videoBitrate}`,

      "-bufsize",
      `${videoBitrate * 2}`,

      "-c:a",
      "aac",

      "-b:a",
      "64k",

      "-movflags",
      "+faststart",

      outputName,
    ]);

    if (exitCode !== 0) {
      throw new Error("Video compression failed.");
    }

    /* =====================================
       Read Compressed File
    ===================================== */

    const data = await instance.readFile(outputName);

    if (typeof data === "string") {
      throw new Error("Unexpected text output from FFmpeg.");
    }

    /* =====================================
       Safe ArrayBuffer
    ===================================== */

    const arrayBuffer = new ArrayBuffer(data.byteLength);

    const target = new Uint8Array(arrayBuffer);

    target.set(data);

    /* =====================================
       Blob
    ===================================== */

    const blob = new Blob([arrayBuffer], {
      type: "video/mp4",
    });

    /* =====================================
       Final File
    ===================================== */

    const compressedFile = new File(
      [blob],
      file.name.replace(/\.[^/.]+$/, ".mp4"),
      {
        type: "video/mp4",
        lastModified: Date.now(),
      },
    );

    onProgress?.(100);

    return compressedFile;
  } finally {
    /* =====================================
       Cleanup
    ===================================== */

    try {
      await instance.deleteFile(inputName);
    } catch {
      // Ignore cleanup error
    }

    try {
      await instance.deleteFile(outputName);
    } catch {
      // Ignore cleanup error
    }

    instance.off("progress", progressHandler);
  }
}

/* =========================================
   File Extension
========================================= */

function getExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() || "mp4";
}
