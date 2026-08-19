"use client";

import { useState } from "react";
import { compressMedia } from "@/lib/media/compressMedia";

export default function MediaCompressionTest() {
  const [file, setFile] = useState<File | null>(null);

  const [compressedFile, setCompressedFile] = useState<File | null>(null);

  const [progress, setProgress] = useState(0);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function handleFile(selectedFile: File) {
    setFile(selectedFile);
    setCompressedFile(null);
    setError("");
    setProgress(0);

    try {
      setLoading(true);

      const result = await compressMedia(selectedFile, {
        onProgress: (value: number) => {
          setProgress(value);
        },
      });
      setCompressedFile(result);

      console.log("==============================");

      console.log(
        "Original:",
        (selectedFile.size / 1024 / 1024).toFixed(2),
        "MB",
      );

      console.log("Compressed:", (result.size / 1024 / 1024).toFixed(2), "MB");

      console.log(
        "Saved:",
        ((1 - result.size / selectedFile.size) * 100).toFixed(1),
        "%",
      );

      console.log("==============================");
    } catch (err) {
      console.error("MEDIA COMPRESSION ERROR:", err);

      setError(err instanceof Error ? err.message : "Compression failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Media Compression Test
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Test image and video compression.
        </p>

        {/* File Input */}

        <label className="mt-6 block cursor-pointer rounded-xl border-2 border-dashed border-slate-300 p-8 text-center transition hover:border-blue-500 dark:border-slate-700">
          <input
            type="file"
            accept="image/*,video/*"
            hidden
            disabled={loading}
            onChange={(event) => {
              const selected = event.target.files?.[0];

              if (selected) {
                handleFile(selected);
              }

              event.target.value = "";
            }}
          />

          <p className="font-semibold text-slate-800 dark:text-white">
            Select Image or Video
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Click to choose a media file
          </p>
        </label>

        {/* Original */}

        {file && (
          <div className="mt-5 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
            <p className="text-sm font-semibold text-slate-800 dark:text-white">
              Original
            </p>

            <p className="mt-1 text-sm text-slate-500">{file.name}</p>

            <p className="mt-1 text-xs text-slate-400">
              {formatFileSize(file.size)}
            </p>
          </div>
        )}

        {/* Progress */}

        {loading && (
          <div className="mt-5">
            <div className="mb-2 flex justify-between text-xs">
              <span className="text-slate-500">Compressing...</span>

              <span className="font-semibold text-blue-600">{progress}%</span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-full rounded-full bg-[#1565d8] transition-all duration-200"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Result */}

        {compressedFile && (
          <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
            <p className="font-semibold text-green-700 dark:text-green-400">
              Compression Complete
            </p>

            <div className="mt-3 space-y-1 text-sm">
              <p>
                Original: <strong>{formatFileSize(file?.size ?? 0)}</strong>
              </p>

              <p>
                Compressed:{" "}
                <strong>{formatFileSize(compressedFile.size)}</strong>
              </p>

              {file && (
                <p>
                  Saved:{" "}
                  <strong>
                    {((1 - compressedFile.size / file.size) * 100).toFixed(1)}%
                  </strong>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Error */}

        {error && (
          <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
