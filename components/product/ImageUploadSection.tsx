"use client";

import { useState } from "react";
import {
  CheckCircle2,
  CloudUpload,
  Info,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import ImageDropzone from "./ImageDropzone";
import ImagePreviewGrid from "./ImagePreviewGrid";

interface UploadedImage {
  publicId: string;
  url: string;
  imageHash?: string;
}

interface Props {
  uploadedImages: UploadedImage[];
  setUploadedImages: React.Dispatch<
    React.SetStateAction<UploadedImage[]>
  >;
  thumbnailIndex: number;
  setThumbnailIndex: React.Dispatch<
    React.SetStateAction<number>
  >;
}

export default function ImageUploadSection({
  uploadedImages,
  setUploadedImages,
  thumbnailIndex,
  setThumbnailIndex,
}: Props) {
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  function removeImage(index: number) {
    const updated = images.filter((_, i) => i !== index);

    setImages(updated);

    if (
      updated.length > 0 &&
      thumbnailIndex >= updated.length
    ) {
      setThumbnailIndex(0);
    }
  }

  function removeExistingImage(index: number) {
    const updated = uploadedImages.filter(
      (_, i) => i !== index,
    );

    setUploadedImages(updated);

    if (
      updated.length > 0 &&
      thumbnailIndex >= updated.length
    ) {
      setThumbnailIndex(0);
    }
  }

  function makeThumbnail(index: number) {
    setThumbnailIndex(index);
  }

  async function uploadImages() {
    if (uploading) return;

    if (images.length === 0) {
      toast.error("Please select at least one image.");
      return;
    }

    const totalImages =
      uploadedImages.length + images.length;

    if (totalImages > 10) {
      toast.error(
        `You can upload a maximum of 10 images. You currently have ${uploadedImages.length} uploaded.`,
      );
      return;
    }

    try {
      setUploading(true);
      setProgress(0);

      const uploaded: UploadedImage[] = [];

      // Keep the previous working upload flow
      for (let i = 0; i < images.length; i++) {
        const formData = new FormData();

        formData.append("file", images[i]);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message);
        }

        uploaded.push(result.image);

        setProgress(
          Math.round(
            ((i + 1) / images.length) * 100,
          ),
        );
      }

      setUploadedImages((prev) => [
        ...prev,
        ...uploaded,
      ]);

      setImages([]);

      setProgress(100);

      toast.success(
        `${uploaded.length} image${
          uploaded.length > 1 ? "s" : ""
        } uploaded successfully.`,
      );
    } catch (error) {
      console.error(
        "IMAGE UPLOAD ERROR:",
        error,
      );

      toast.error("Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
          <CloudUpload className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Product Photos
          </h2>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Add clear photos of your product
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <ImageDropzone
          images={images}
          setImages={setImages}
        />
      </div>

      {/* Selected + Uploaded Images */}
      {(images.length > 0 ||
        uploadedImages.length > 0) && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          {/* Top information */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Product Photos
              </h3>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {uploadedImages.length} uploaded
                {images.length > 0 &&
                  ` • ${images.length} selected`}
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {uploadedImages.length +
                images.length}
              /10
            </span>
          </div>

          {/* Existing Preview Grid */}
          <ImagePreviewGrid
            images={images}
            uploadedImages={uploadedImages}
            thumbnailIndex={thumbnailIndex}
            onRemove={removeImage}
            onRemoveExisting={
              removeExistingImage
            }
            onMakeThumbnail={makeThumbnail}
          />

          {/* Upload Button */}
          {images.length > 0 && (
            <div className="mt-5">
              <button
                type="button"
                onClick={uploadImages}
                disabled={uploading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading {progress}%
                  </>
                ) : (
                  <>
                    <CloudUpload className="h-4 w-4" />
                    Upload Photos
                  </>
                )}
              </button>
            </div>
          )}

          {/* Progress */}
          {uploading && (
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  Uploading photos...
                </span>

                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {progress}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Success State */}
      {uploadedImages.length > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />

          <span>
            {uploadedImages.length} product photo
            {uploadedImages.length > 1
              ? "s"
              : ""}{" "}
            uploaded successfully.
          </span>
        </div>
      )}

      {/* Photo Tips */}
      <div className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />

        <div className="text-xs leading-5 text-slate-600 dark:text-slate-300">
          <p className="font-semibold text-slate-800 dark:text-slate-100">
            Photo tips
          </p>

          <p className="mt-1">
            Use clear, well-lit photos. Add multiple
            angles and make sure the main product
            photo shows the item clearly.
          </p>
        </div>
      </div>
    </section>
  );
}