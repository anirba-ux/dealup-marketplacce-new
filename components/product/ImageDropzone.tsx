"use client";

import { ChangeEvent } from "react";
import { Upload, ImagePlus } from "lucide-react";

interface Props {
  images: File[];
  setImages: React.Dispatch<React.SetStateAction<File[]>>;
}

const MAX_IMAGES = 10;

export default function ImageDropzone({
  images,
  setImages,
}: Props) {
  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const files = event.target.files;

    if (!files) return;

    const selectedFiles = Array.from(files);

    // Only image files
    const imageFiles = selectedFiles.filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length !== selectedFiles.length) {
      alert("Please select image files only.");
      return;
    }

    const totalImages =
      images.length + imageFiles.length;

    if (totalImages > MAX_IMAGES) {
      alert(
        `Maximum ${MAX_IMAGES} images allowed.`
      );
      return;
    }

    setImages((prev) => [
      ...prev,
      ...imageFiles,
    ]);

    // Allow selecting the same file again
    event.target.value = "";
  }

  return (
    <div className="space-y-5">
      <label
        htmlFor="product-images"
        className="
          group
          flex
          h-72
          w-full
          cursor-pointer
          flex-col
          items-center
          justify-center
          rounded-3xl
          border-2
          border-dashed
          border-blue-300
          bg-blue-50
          transition
          hover:border-[#1565d8]
          hover:bg-blue-100
          dark:border-blue-800
          dark:bg-slate-900
          dark:hover:bg-slate-800
        "
      >
        <Upload
          size={55}
          className="
            mb-5
            text-[#1565d8]
            transition
            group-hover:scale-110
          "
        />

        <h3 className="text-xl font-bold text-slate-800 dark:text-white">
          Upload Product Images
        </h3>

        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Drag & Drop or Click to Select
        </p>

        <p
          className="
            mt-3
            rounded-full
            bg-white
            px-4
            py-2
            text-sm
            font-medium
            text-[#1565d8]
            shadow
            dark:bg-slate-900
          "
        >
          Maximum {MAX_IMAGES} Images
        </p>

        <input
          id="product-images"
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>

      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <ImagePlus size={18} />

        <span>
          JPG, JPEG, PNG, WEBP, AVIF, GIF, BMP, SVG and other image formats supported
        </span>
      </div>
    </div>
  );
}