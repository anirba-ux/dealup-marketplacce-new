"use client";

interface ImageUploadButtonProps {
  onSelect: (file: File) => void;
}

export default function ImageUploadButton({
  onSelect,
}: ImageUploadButtonProps) {
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
      <span
        className="
          flex
          h-12
          w-12
          items-center
          justify-center

          rounded-full

          bg-blue-100

          text-2xl
        "
      >
        📷
      </span>

      <div className="flex-1">
        <p className="font-semibold">Photo</p>

        <p className="text-xs text-slate-500">JPG, PNG, WEBP</p>
      </div>

      <input
        hidden
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];

          if (file) {
            onSelect(file);

            e.target.value = "";
          }
        }}
      />
    </label>
  );
}
