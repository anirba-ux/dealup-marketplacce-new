"use client";

import { FileText, X, Send } from "lucide-react";

interface DocumentPreviewModalProps {
  file: File | null;
  onClose: () => void;
  onSend: () => void;
}

export default function DocumentPreviewModal({
  file,
  onClose,
  onSend,
}: DocumentPreviewModalProps) {
  if (!file) {
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

  return (
    <div
      className="
        fixed
        inset-0
        z-[150]

        flex
        items-center
        justify-center

        bg-black/60

        p-4

        backdrop-blur-sm
      "
      onClick={onClose}
    >
      <div
        className="
          w-full
          max-w-md

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
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            Attach Document
          </h2>

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

              transition

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

        {/* File Preview */}
        <div className="px-6 py-8">
          <div
            className="
              flex
              flex-col
              items-center
              justify-center

              rounded-2xl

              border
              border-slate-200

              bg-slate-50

              px-5
              py-8

              dark:border-slate-700
              dark:bg-slate-800
            "
          >
            {/* File Icon */}
            <div
              className="
                flex
                h-20
                w-20
                items-center
                justify-center

                rounded-2xl

                bg-orange-100

                text-orange-600

                dark:bg-orange-950/40
                dark:text-orange-400
              "
            >
              <FileText size={40} />
            </div>

            {/* File Name */}
            <p
              className="
                mt-5
                max-w-full

                truncate

                px-3

                text-center

                text-base
                font-semibold

                text-slate-800

                dark:text-white
              "
              title={file.name}
            >
              {file.name}
            </p>

            {/* File Size */}
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {formatFileSize(file.size)}
            </p>

            {/* File Type */}
            <p className="mt-1 text-xs uppercase text-slate-400">
              {file.type || "Document"}
            </p>
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

              transition

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
    </div>
  );
}