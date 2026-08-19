"use client";

import { useTranslations } from "next-intl";

export default function TestPage() {
  const t = useTranslations("common");

  return (
    <div className="space-y-4 p-10">
      <h1 className="text-3xl font-bold">{t("home")}</h1>

      <p>{t("profile")}</p>

      <button className="rounded bg-blue-600 px-4 py-2 text-white">
        {t("sell")}
      </button>
    </div>
  );
}