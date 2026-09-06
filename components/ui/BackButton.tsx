"use client";

import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  return (
    <button
      type="button"
      onClick={() => window.history.back()}
      className="
        inline-flex
        items-center
        gap-2
        rounded-xl
        border
        border-white/25
        bg-white/10
        px-3
        py-2
        text-sm
        font-semibold
        text-white
        backdrop-blur-md
        transition-all
        duration-200
        hover:border-white/40
        hover:bg-white/20
        hover:shadow-md
        active:scale-95
        sm:px-4
      "
    >
      <ArrowLeft className="h-4 w-4" />
      <span>Back</span>
    </button>
  );
}