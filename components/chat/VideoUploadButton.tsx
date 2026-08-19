"use client";

interface VideoUploadButtonProps {
  onSelect: (file: File) => void;
}

export default function VideoUploadButton({
  onSelect,
}: VideoUploadButtonProps) {
  return (
    <label
      className="
        flex
        w-full
        cursor-pointer
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
      {/* Icon */}
      <span
        className="
          flex
          h-12
          w-12
          shrink-0
          items-center
          justify-center

          rounded-full

          bg-red-100

          text-2xl
        "
      >
        🎥
      </span>

      {/* Text */}
      <div className="flex-1">
        <p className="font-semibold text-slate-800 dark:text-white">
          Video
        </p>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          MP4, MOV, WEBM
        </p>
      </div>

      {/* File Input */}
      <input
        hidden
        type="file"
        accept="video/mp4,video/quicktime,video/webm"
        onChange={(event) => {
          const file = event.target.files?.[0];

          if (!file) {
            return;
          }

          onSelect(file);

          event.target.value = "";
        }}
      />
    </label>
  );
}