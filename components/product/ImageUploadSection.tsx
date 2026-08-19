"use client";

import { useState } from "react";

import ImageDropzone from "./ImageDropzone";
import ImagePreviewGrid from "./ImagePreviewGrid";

interface UploadedImage {
  publicId: string;
  url: string;
}

interface Props {
  uploadedImages: UploadedImage[];
  setUploadedImages: React.Dispatch<React.SetStateAction<UploadedImage[]>>;

  thumbnailIndex: number;
  setThumbnailIndex: React.Dispatch<React.SetStateAction<number>>;
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

  /* ==========================
      Remove Image
  ========================== */

  function removeImage(index: number) {
    const updated = images.filter((_, i) => i !== index);

    setImages(updated);

    if (thumbnailIndex >= updated.length) {
      setThumbnailIndex(0);
    }
  }

  /* ==========================
    Remove Existing Image
========================== */

  function removeExistingImage(index: number) {
    const updated = uploadedImages.filter((_, i) => i !== index);

    setUploadedImages(updated);
  }

  /* ==========================
      Make Thumbnail
  ========================== */

  function makeThumbnail(index: number) {
    setThumbnailIndex(index);
  }

  /* ==========================
      Upload Images
  ========================== */

  async function uploadImages() {
    if (images.length === 0) {
      alert("Please select at least one image.");

      return;
    }

    try {
      setUploading(true);

      setProgress(0);

      const uploaded: UploadedImage[] = [];

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

        setProgress(Math.round(((i + 1) / images.length) * 100));
      }

      setUploadedImages((prev) => [...prev, ...uploaded]);

      setImages([]);

      alert("✅ Images uploaded successfully.");
    } catch (error) {
      console.error(error);

      alert("Image upload failed.");
    } finally {
      setUploading(false);
    }
  }
  return (
    <section className="space-y-8">
      {/* Header */}

      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Product Images</h2>

        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Upload high-quality images of your product. You can upload up to 10
          images.
        </p>
      </div>

      {/* Upload Area */}

      <ImageDropzone images={images} setImages={setImages} />

      {/* Preview Grid */}

      <ImagePreviewGrid
        images={images}
        uploadedImages={uploadedImages}
        thumbnailIndex={thumbnailIndex}
        onRemove={removeImage}
        onRemoveExisting={removeExistingImage}
        onMakeThumbnail={makeThumbnail}
      />

      {/* Progress */}

      {uploading && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">
              Uploading Images...
            </span>

            <span className="text-sm font-semibold text-[#1565d8]">
              {progress}%
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-[#1565d8] transition-all duration-300"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Uploaded Success */}

      {uploadedImages.length > 0 && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
          <h3 className="font-semibold text-green-700">✅ Upload Complete</h3>

          <p className="mt-2 text-sm text-green-600">
            {uploadedImages.length} image(s) uploaded successfully.
          </p>
        </div>
      )}

      {/* Footer */}

      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h4 className="font-semibold text-slate-800">Selected Images</h4>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            {images.length} / 10 Images Selected
          </p>
        </div>

        <button
          type="button"
          onClick={uploadImages}
          disabled={uploading || images.length === 0}
          className="rounded-2xl bg-[#1565d8] px-8 py-3 font-semibold text-white shadow-lg transition hover:bg-[#0f52ba] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "☁ Upload Images"}
        </button>
      </div>

      {/* Tips */}

      <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6">
        <h4 className="font-semibold text-[#1565d8]">📸 Photo Tips</h4>

        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
          <li>Upload clear, high-resolution photos.</li>
          <li>Use natural lighting whenever possible.</li>
          <li>Show the product from multiple angles.</li>
          <li>Highlight any defects honestly.</li>
          <li>The first image will be your product thumbnail.</li>
        </ul>
      </div>
    </section>
  );
}
