"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import ProductLocationMap from "./ProductLocationMap";

interface Props {
  open: boolean;
  onClose: () => void;

  latitude: number;
  longitude: number;

  address: string;
}

export default function FullscreenMapModal({
  open,
  onClose,
  latitude,
  longitude,
  address,
}: Props) {
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="
fixed
inset-0
z-[9999]

flex
items-center
justify-center

bg-black/70
backdrop-blur-sm

p-4
"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
relative

w-full
max-w-6xl

rounded-3xl

bg-white

shadow-2xl

dark:bg-slate-900

overflow-hidden
"
      >
        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-700">
          <h2 className="text-2xl font-bold">
            Product Location
          </h2>

          <button
            onClick={onClose}
            className="
rounded-xl

p-2

transition

hover:bg-slate-100

dark:hover:bg-slate-800
"
          >
            <X size={22} />
          </button>
        </div>

        {/* Map */}

        <div className="h-[75vh]">
          <ProductLocationMap
            latitude={latitude}
            longitude={longitude}
          />
        </div>

        {/* Footer */}

        <div className="border-t border-slate-200 p-5 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            📍 {address}
          </p>
        </div>
      </div>
    </div>
  );
}