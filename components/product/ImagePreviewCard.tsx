"use client";

import Image from "next/image";
import { Star, Trash2 } from "lucide-react";

interface Props {
  file: File;
  index: number;
  isThumbnail: boolean;
  onRemove: (index: number) => void;
  onMakeThumbnail: (index: number) => void;
}

export default function ImagePreviewCard({
  file,
  index,
  isThumbnail,
  onRemove,
  onMakeThumbnail,
}: Props) {
  const preview = URL.createObjectURL(file);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm transition hover:shadow-lg">

      {/* Image */}

      <div className="relative h-52 w-full">

        <Image
          src={preview}
          alt={file.name}
          fill
          className="object-cover"
        />

      </div>

      {/* Bottom */}

      <div className="space-y-3 p-4">

        <p className="truncate text-sm font-medium text-slate-700">
          {file.name}
        </p>

        <div className="flex items-center justify-between">

          <button
            type="button"
            onClick={() => onMakeThumbnail(index)}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
              isThumbnail
                ? "bg-yellow-100 text-yellow-700"
                : "bg-slate-100 hover:bg-yellow-100"
            }`}
          >
            <Star
              size={16}
              fill={isThumbnail ? "currentColor" : "none"}
            />

            {isThumbnail
              ? "Thumbnail"
              : "Make Thumbnail"}
          </button>

          <button
            type="button"
            onClick={() => onRemove(index)}
            className="rounded-xl bg-red-50 p-2 text-red-500 transition hover:bg-red-100"
          >
            <Trash2 size={18} />
          </button>

        </div>

      </div>

      {/* Thumbnail Badge */}

      {isThumbnail && (
        <div className="absolute left-3 top-3 rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-white shadow">
          Thumbnail
        </div>
      )}

    </div>
  );
}