"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

import { setLocale } from "@/lib/locale";

interface LanguageSwitcherProps {
  compact?: boolean;
}

export default function LanguageSwitcher({
  compact = false,
}: LanguageSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  async function handleChange(
    e: React.ChangeEvent<HTMLSelectElement>
  ) {
    const newLocale = e.target.value;

    await setLocale(newLocale);

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div
      className={
        compact
          ? ""
          : "border-t border-slate-200 px-5 py-3 dark:border-slate-700"
      }
    >
      {!compact && (
        <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">
          Language
        </label>
      )}

      <select
        value={locale}
        onChange={handleChange}
        disabled={isPending}
        className={
          compact
            ? "h-9 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#1565d8] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            : "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-[#1565d8] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        }
      >
        <option value="en">🇺🇸 English</option>
        <option value="bn">🇧🇩 বাংলা</option>
        <option value="hi">🇮🇳 हिन्दी</option>
      </select>
    </div>
  );
}