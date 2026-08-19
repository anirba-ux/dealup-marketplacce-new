"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";
import ImagePreviewCard from "./ImagePreviewCard";

interface UploadedImage {
  publicId: string;
  url: string;
}

interface Props {
  images: File[];

  uploadedImages?: UploadedImage[];

  thumbnailIndex: number;

  onRemove: (index: number) => void;

  onRemoveExisting?: (index: number) => void;

  onMakeThumbnail: (index: number) => void;
}

export default function ImagePreviewGrid({
  images,
  uploadedImages = [],
  thumbnailIndex,
  onRemove,
  onRemoveExisting,
  onMakeThumbnail,
}: Props) {

  console.log("GRID uploadedImages:", uploadedImages);
  console.log("GRID images:", images);
  // ----------------------------
  // EDIT MODE
  // ----------------------------

  if (images.length === 0 && uploadedImages.length > 0) {
    return (
      <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
        {uploadedImages.map((image, index) => (
          <div
            key={image.publicId}
            className="overflow-hidden rounded-2xl border bg-white dark:bg-slate-900 shadow"
          >
            <Image
              src={image.url}
              alt=""
              width={400}
              height={400}
              className="aspect-square w-full object-cover"
            />

            <div className="flex items-center gap-2 p-3">
              <button
                type="button"
                onClick={() => onMakeThumbnail(index)}
                className="flex-1 rounded-lg border py-2 text-sm"
              >
                {thumbnailIndex === index ? "Thumbnail" : "Make Thumbnail"}
              </button>

              <button
                type="button"
                onClick={() => onRemoveExisting?.(index)}
                className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ----------------------------
  // EMPTY
  // ----------------------------

  if (images.length === 0 && uploadedImages.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
        <h3 className="text-lg font-semibold">No Images Selected</h3>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Upload product images to preview them here.
        </p>
      </div>
    );
  }

  // ----------------------------
  // CREATE MODE
  // ----------------------------

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {uploadedImages.map((image, index) => (
        <div
          key={image.publicId}
          className="overflow-hidden rounded-2xl border bg-white dark:bg-slate-900 shadow"
        >
          <Image
            src={image.url}
            alt=""
            width={400}
            height={400}
            className="aspect-square w-full object-cover"
          />

          <div className="flex items-center gap-2 p-3">
            <button
              type="button"
              onClick={() => onMakeThumbnail(index)}
              className="flex-1 rounded-lg border py-2 text-sm"
            >
              {thumbnailIndex === index ? "Thumbnail" : "Make Thumbnail"}
            </button>

            <button
              type="button"
              onClick={() => onRemoveExisting?.(index)}
              className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}
      {images.map((file, index) => (
        <ImagePreviewCard
          key={`${file.name}-${index}`}
          file={file}
          index={index}
          isThumbnail={thumbnailIndex === index}
          onRemove={onRemove}
          onMakeThumbnail={onMakeThumbnail}
        />
      ))}
    </div>
  );
}
