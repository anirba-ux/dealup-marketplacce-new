"use client";

import { useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface ImageViewerModalProps {
  imageUrl: string | null;
  imageName?: string;
  onClose: () => void;
}

export default function ImageViewerModal({
  imageUrl,
  imageName,
  onClose,
}: ImageViewerModalProps) {
  // Escape key
  useEffect(() => {
    if (!imageUrl) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [imageUrl, onClose]);

  if (!imageUrl) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[200]

        flex
        items-center
        justify-center

        bg-black/90

        p-4
        backdrop-blur-sm
      "
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        type="button"
        onClick={onClose}
        className="
          absolute
          right-5
          top-5
          z-10

          flex
          h-11
          w-11
          items-center
          justify-center

          rounded-full

          bg-white/10

          text-white

          backdrop-blur-md

          transition-all
          duration-200

          hover:bg-white/20

          active:scale-95
        "
        aria-label="Close image viewer"
      >
        <X size={24} />
      </button>

      {/* Image */}
      <div
        className="
          relative

          flex
          max-h-[90vh]
          max-w-[95vw]

          items-center
          justify-center
        "
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <Image
          src={imageUrl}
          alt={imageName || "Shared image"}
          width={1600}
          height={1200}
          unoptimized
          className="
            max-h-[90vh]
            max-w-[95vw]

            rounded-xl

            object-contain
          "
        />
      </div>
    </div>
  );
}