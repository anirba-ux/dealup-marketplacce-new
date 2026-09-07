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
        border-slate-200
        bg-white
        px-3
        py-2
        text-sm
        font-semibold
        text-slate-700
        shadow-sm
        transition-all
        duration-200

        hover:border-[#1565d8]/30
        hover:bg-slate-50
        hover:text-[#1565d8]
        hover:shadow-md

        active:scale-95

        dark:border-white/20
        dark:bg-white/10
        dark:text-white
        dark:hover:border-white/40
        dark:hover:bg-white/20
        dark:hover:text-white

        sm:px-4
      "
    >
      <ArrowLeft className="h-4 w-4 shrink-0" />

      <span>Back</span>
    </button>
  );
}