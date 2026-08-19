"use client";

import { X, Send, Video } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

interface VideoPreviewModalProps {
  file: File | null;
  onClose: () => void;
  onSend: () => void;
}

export default function VideoPreviewModal({
  file,
  onClose,
  onSend,
}: VideoPreviewModalProps) {
  const [mounted, setMounted] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);

    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  if (!mounted || !file || !previewUrl) {
    return null;
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function getVideoType(fileName: string) {
    const extension = fileName.split(".").pop()?.toUpperCase() || "VIDEO";

    return `${extension} Video`;
  }

  return createPortal(
    <div
      className="
        fixed
        inset-0
        z-[99999]

        flex
        items-center
        justify-center

        bg-black/60

        p-4

        backdrop-blur-md
      "
      onClick={onClose}
    >
      <div
        className="
          relative
          z-[100000]

          w-full
          max-w-2xl

          overflow-hidden

          rounded-3xl

          border
          border-slate-200

          bg-white

          shadow-2xl

          dark:border-slate-700
          dark:bg-slate-900
        "
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        {/* Header */}
        <div
          className="
            flex
            items-center
            justify-between

            border-b
            border-slate-200

            px-5
            py-4

            dark:border-slate-700
          "
        >
          <div className="flex items-center gap-2">
            <Video size={20} className="text-red-500" />

            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              Attach Video
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center

              rounded-full

              text-slate-500

              transition-all

              hover:bg-slate-100
              hover:text-slate-800

              dark:hover:bg-slate-800
              dark:hover:text-white
            "
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Video Preview */}
        <div className="px-5 py-5">
          <div
            className="
      overflow-hidden
      rounded-2xl
      bg-black
      shadow-inner
    "
          >
            <video
              src={previewUrl}
              controls
              playsInline
              className="
        max-h-[55vh]
        w-full
        object-contain
      "
            />
          </div>

          {/* File Information */}
          <div
            className="
      mt-4
      flex
      items-center
      gap-3
      rounded-xl
      bg-slate-50
      px-4
      py-3
      dark:bg-slate-800
    "
          >
            <div
              className="
        flex
        h-11
        w-11
        shrink-0
        items-center
        justify-center
        rounded-xl
        bg-red-100
        text-red-600
        dark:bg-red-950/40
        dark:text-red-400
      "
            >
              <Video size={22} />
            </div>

            <div className="min-w-0 flex-1">
              <p
                className="
          truncate
          text-sm
          font-semibold
          text-slate-800
          dark:text-white
        "
                title={file.name}
              >
                {file.name}
              </p>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {getVideoType(file.name)} • {formatFileSize(file.size)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="
            flex
            items-center
            justify-end
            gap-3

            border-t
            border-slate-200

            px-5
            py-4

            dark:border-slate-700
          "
        >
          {/* Cancel */}
          <button
            type="button"
            onClick={onClose}
            className="
              rounded-xl

              px-5
              py-2.5

              text-sm
              font-semibold

              text-slate-600

              transition-all

              hover:bg-slate-100

              dark:text-slate-300
              dark:hover:bg-slate-800
            "
          >
            Cancel
          </button>

          {/* Send */}
          <button
            type="button"
            onClick={onSend}
            className="
              flex
              items-center
              gap-2

              rounded-xl

              bg-[#1565d8]

              px-5
              py-2.5

              text-sm
              font-semibold

              text-white

              shadow-md

              transition-all
              duration-200

              hover:bg-[#1256b8]

              active:scale-95
            "
          >
            <Send size={17} />
            Send
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
