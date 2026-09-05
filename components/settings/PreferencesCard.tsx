"use client";

import { useTheme } from "@teispace/next-themes";
import { useEffect, useState } from "react";

interface PreferencesCardProps {
  language: string;
  theme: string;
  onLanguageChange: (value: string) => void;
  onThemeChange: (value: string) => void;
}

export default function PreferencesCard({
  language,
  theme,
  onLanguageChange,
  onThemeChange,
}: PreferencesCardProps) {
  const { theme: currentTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const selectedTheme = currentTheme || theme || "system";

  function handleThemeChange(value: string) {
    setTheme(value);
    onThemeChange(value);
  }

  return (
    <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="mb-8 text-xl font-bold text-slate-900 dark:text-white">
        Preferences
      </h2>

      {/* Language */}
      <div className="mb-10">
        <h3 className="mb-4 text-lg font-semibold">
          🌐 Language
        </h3>

        <div className="space-y-3">

          {/* English */}
          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 p-4 hover:border-blue-500 dark:border-slate-700 dark:hover:border-blue-400">
            <div>
              <p className="font-semibold">
                English
              </p>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Default Language
              </p>
            </div>

            <input
              type="radio"
              name="language"
              value="en"
              checked={language === "en"}
              onChange={(e) =>
                onLanguageChange(e.target.value)
              }
            />
          </label>

          {/* Bengali */}
          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 p-4 hover:border-blue-500 dark:border-slate-700 dark:hover:border-blue-400">
            <div>
              <p className="font-semibold">
                বাংলা
              </p>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Bengali
              </p>
            </div>

            <input
              type="radio"
              name="language"
              value="bn"
              checked={language === "bn"}
              onChange={(e) =>
                onLanguageChange(e.target.value)
              }
            />
          </label>

          {/* Hindi */}
          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 p-4 hover:border-blue-500 dark:border-slate-700 dark:hover:border-blue-400">
            <div>
              <p className="font-semibold">
                हिन्दी
              </p>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Hindi
              </p>
            </div>

            <input
              type="radio"
              name="language"
              value="hi"
              checked={language === "hi"}
              onChange={(e) =>
                onLanguageChange(e.target.value)
              }
            />
          </label>

        </div>
      </div>

      {/* Appearance */}
      <div>
        <h3 className="mb-4 text-lg font-semibold">
          🎨 Appearance
        </h3>

        <div className="space-y-3">

          {/* System */}
          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 p-4 hover:border-blue-500 dark:border-slate-700 dark:hover:border-blue-400">
            <div>
              <p className="font-semibold">
                System Default
              </p>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Follow your device theme
              </p>
            </div>

            <input
              type="radio"
              name="theme"
              value="system"
              checked={selectedTheme === "system"}
              onChange={() =>
                handleThemeChange("system")
              }
            />
          </label>

          {/* Light */}
          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 p-4 hover:border-blue-500 dark:border-slate-700 dark:hover:border-blue-400">
            <div>
              <p className="font-semibold">
                Light
              </p>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Bright appearance
              </p>
            </div>

            <input
              type="radio"
              name="theme"
              value="light"
              checked={selectedTheme === "light"}
              onChange={() =>
                handleThemeChange("light")
              }
            />
          </label>

          {/* Dark */}
          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 p-4 hover:border-blue-500 dark:border-slate-700 dark:hover:border-blue-400">
            <div>
              <p className="font-semibold">
                Dark
              </p>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Dark appearance
              </p>
            </div>

            <input
              type="radio"
              name="theme"
              value="dark"
              checked={selectedTheme === "dark"}
              onChange={() =>
                handleThemeChange("dark")
              }
            />
          </label>

        </div>
      </div>
    </div>
  );
}