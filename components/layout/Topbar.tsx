"use client";

import { MapPin, Headset } from "lucide-react";
import { useTranslations } from "next-intl";

import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

export default function Topbar() {
  const t = useTranslations("common");

  return (
    <div className="hidden border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 lg:block">
      <div className="mx-auto flex h-10 max-w-7xl items-center justify-between px-4">
        {/* Left Side */}
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <MapPin size={15} className="text-[#1565d8]" />
          <span className="font-medium">Bansberia, Hooghly</span>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-6">
          {/* Help Center */}
          <button
            type="button"
            className="flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-[#1565d8] dark:text-slate-300"
          >
            <Headset size={15} />
            <span>{t("helpCenter")}</span>
          </button>

          {/* Divider */}
          <div className="h-5 w-px bg-slate-300 dark:bg-slate-700" />

          {/* Language */}
          <div className="flex items-center rounded-md border border-slate-200 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-900">
            <LanguageSwitcher compact />
          </div>
        </div>
      </div>
    </div>
  );
}
