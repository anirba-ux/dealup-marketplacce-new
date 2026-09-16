"use client";

import { Headset, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import UserLocationDisplay from "@/components/ui/UserLocationDisplay";

export default function Topbar() {
  const t = useTranslations("common");

  return (
    <div className="hidden border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 lg:block">
      <div className="mx-auto flex h-10 max-w-7xl items-center justify-between px-4 lg:px-6">
        {/* =========================================
            Desktop Location
        ========================================= */}

        <button
          type="button"
          aria-label="Current location"
          className="
            flex items-center gap-2
            text-sm font-medium
            text-slate-700
            transition-colors
            hover:text-[#1565d8]
            dark:text-slate-200
            dark:hover:text-blue-400
          "
        >
          <UserLocationDisplay />

          <ChevronDown
            size={14}
            className="shrink-0 text-slate-400 dark:text-slate-500"
          />
        </button>

        {/* =========================================
            Help + Language
        ========================================= */}

        <div className="flex items-center gap-5">
          <button
            type="button"
            className="
              flex items-center gap-2
              text-sm font-medium
              text-slate-700
              transition-colors
              hover:text-[#1565d8]
              dark:text-slate-200
              dark:hover:text-blue-400
            "
          >
            <Headset size={15} strokeWidth={2} />

            <span>{t("helpCenter")}</span>
          </button>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />

          <div
            className="
              flex items-center
              rounded-lg
              border border-slate-200
              bg-slate-50
              px-2 py-1
              transition-colors
              hover:border-slate-300
              dark:border-slate-700
              dark:bg-slate-900
              dark:hover:border-slate-600
            "
          >
            <LanguageSwitcher compact />
          </div>
        </div>
      </div>
    </div>
  );
}