"use client";

import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  return (
    <button
      type="button"
      onClick={() => window.history.back()}
      className="
        inline-flex items-center gap-2 rounded-xl border border-slate-200
        bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm
        transition hover:border-blue-500 hover:text-blue-600
        dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200
        dark:hover:border-blue-400 dark:hover:text-blue-400
        sm:px-4
      "
    >
      <ArrowLeft className="h-4 w-4" />
      <span>Back</span>
    </button>
  );
}