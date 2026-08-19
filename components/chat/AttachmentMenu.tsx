"use client";

import ImageUploadButton from "./ImageUploadButton";

import DocumentUploadButton from "./DocumentUploadButton";

import VideoUploadButton from "./VideoUploadButton";

interface AttachmentMenuProps {
  open: boolean;
  onClose: () => void;

  onImageSelect: (file: File) => void;

  onDocumentSelect: (file: File) => void;

  onVideoSelect: (file: File) => void;
}

export default function AttachmentMenu({
  open,
  onClose,
  onImageSelect,
  onDocumentSelect,
  onVideoSelect,
}: AttachmentMenuProps) {
  
  if (!open) {
    return null;
  }

  return (
    <div
      className="
        absolute
        bottom-16
        left-0

        z-50

        w-72

        overflow-hidden

        rounded-3xl

        border
        border-slate-200

        bg-white

        shadow-2xl

        dark:border-slate-700
        dark:bg-slate-900
      "
    >
      {/* Header */}
      <div
        className="
          border-b
          border-slate-200

          bg-slate-50

          px-5
          py-4

          dark:border-slate-700
          dark:bg-slate-800
        "
      >
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
          Attach File
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Choose what you want to send
        </p>
      </div>

      {/* Photo */}
      <ImageUploadButton
        onSelect={(file) => {
          onImageSelect(file);
          onClose();
        }}
      />

      {/* Video */}

      <VideoUploadButton
        onSelect={(file) => {
          onVideoSelect(file);
          onClose();
        }}
      />

      {/* Document */}

      <DocumentUploadButton
        onSelect={(file) => {
          onDocumentSelect(file);
          onClose();
        }}
      />

      {/* Audio */}
      <button
        className="
          flex
          w-full
          items-center
          gap-4

          px-5
          py-4

          transition-all
          duration-300

          hover:bg-blue-50
          dark:hover:bg-slate-800
        "
      >
        <span
          className="
            flex
            h-12
            w-12
            items-center
            justify-center

            rounded-full

            bg-green-100

            text-2xl
          "
        >
          🎵
        </span>

        <div className="text-left">
          <p className="font-semibold text-slate-800 dark:text-white">Audio</p>

          <p className="text-xs text-slate-500">MP3, WAV, AAC</p>
        </div>
      </button>

      {/* Divider */}
      <div className="border-t border-slate-200 dark:border-slate-700" />

      {/* Cancel */}
      <button
        onClick={onClose}
        className="
          flex
          w-full
          items-center
          justify-center
          gap-2

          px-5
          py-4

          font-semibold

          text-red-500

          transition-all
          duration-300

          hover:bg-red-50
          dark:hover:bg-red-950/30
        "
      >
        <span>✕</span>
        Cancel
      </button>
    </div>
  );
}
