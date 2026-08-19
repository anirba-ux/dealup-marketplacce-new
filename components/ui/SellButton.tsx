"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function SellButton() {
  const t = useTranslations("common");

  return (
    <Link
      href="/sell"
      className="rounded-lg bg-yellow-500 px-4 py-2 font-semibold text-black transition-all duration-300 hover:scale-105 hover:bg-yellow-400"
    >
      + {t("sell")}
    </Link>
  );
}