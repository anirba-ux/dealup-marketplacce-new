"use client";

import { compressImage } from "./compressImage";
import { compressVideo } from "./compressVideo";

export type MediaCompressionOptions = {
  onProgress?: (progress: number) => void;
};

export async function compressMedia(
  file: File,
  options: MediaCompressionOptions = {},
): Promise<File> {
  // ================================
  // Image
  // ================================

  if (file.type.startsWith("image/")) {
    options.onProgress?.(0);

    const compressedFile =
      await compressImage(file);

    options.onProgress?.(100);

    return compressedFile;
  }

  // ================================
  // Video
  // ================================

  if (file.type.startsWith("video/")) {
    return compressVideo(
      file,
      options.onProgress,
    );
  }

  // ================================
  // Unsupported
  // ================================

  throw new Error(
    `Unsupported media type: ${file.type}`,
  );
}