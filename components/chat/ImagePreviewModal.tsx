"use client";

import Image from "next/image";
import { X, SendHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

interface ImagePreviewModalProps {
  file: File | null;
  onClose: () => void;
  onSend: (file: File, caption: string) => void;
}

export default function ImagePreviewModal({
  file,
  onClose,
  onSend,
}: ImagePreviewModalProps) {
  const [previewUrl, setPreviewUrl] = useState("");
  const [caption, setCaption] = useState("");

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(file);

    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  if (!file || !previewUrl) {
    return null;
  }

  function handleSend() {
    if (!file) {
      return;
    }

    onSend(file, caption.trim());
    setCaption("");
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]

        flex
        items-center
        justify-center

        bg-black/70

        p-4
        backdrop-blur-sm
      "
    >
      {/* Modal */}
      <div
        className="
          flex
          w-full
          max-w-2xl
          flex-col

          overflow-hidden

          rounded-3xl

          bg-white

          shadow-2xl

          dark:bg-slate-900
        "
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
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Send Photo
            </h2>

            <p className="text-xs text-slate-500">
              Preview your photo before sending
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-10
              w-10
              items-center
              justify-center

              rounded-full

              text-slate-500

              transition-all

              hover:bg-slate-100
              hover:text-slate-900

              dark:hover:bg-slate-800
              dark:hover:text-white
            "
            aria-label="Close image preview"
          >
            <X size={20} />
          </button>
        </div>

        {/* Image */}
        <div
          className="
            relative

            flex
            min-h-[300px]

            max-h-[60vh]

            items-center
            justify-center

            bg-slate-100

            p-4

            dark:bg-slate-950
          "
        >
          <Image
            src={previewUrl}
            alt="Selected image preview"
            width={900}
            height={700}
            unoptimized
            className="
              max-h-[55vh]
              w-auto
              max-w-full

              rounded-2xl

              object-contain

              shadow-lg
            "
          />
        </div>

        {/* Caption + Send */}
        <div
          className="
            flex
            items-center
            gap-3

            border-t
            border-slate-200

            p-4

            dark:border-slate-700
          "
        >
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Add a caption..."
            className="
              min-w-0
              flex-1

              rounded-full

              border
              border-slate-300

              bg-slate-50

              px-5
              py-3

              text-sm

              outline-none

              transition

              focus:border-blue-500
              focus:ring-2
              focus:ring-blue-100

              dark:border-slate-700
              dark:bg-slate-800
              dark:text-white
              dark:focus:ring-blue-900
            "
          />

          <button
            type="button"
            onClick={handleSend}
            className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center

              rounded-full

              bg-[#1565d8]

              text-white

              shadow-md

              transition-all
              duration-200

              hover:bg-[#0f52ba]
              hover:scale-105

              active:scale-95
            "
            aria-label="Send photo"
          >
            <SendHorizontal size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
