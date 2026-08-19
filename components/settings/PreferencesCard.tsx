"use client";

import { useTheme } from "next-themes";
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

  useEffect(() => {
    if (mounted && currentTheme) {
      onThemeChange(currentTheme);
    }
  }, [mounted, currentTheme, onThemeChange]);

  if (!mounted) {
    return null;
  }
  return (
    <div className="mt-10 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="mb-8 text-xl font-bold text-slate-900 dark:text-white dark:text-white">
        Preferences
      </h2>

      {/* Language */}

      <div className="mb-10">
        <h3 className="mb-4 text-lg font-semibold">🌐 Language</h3>

        <div className="space-y-3">
          <label className="flex cursor-pointer items-center justify-between rounded-2xl border p-4 hover:border-blue-500">
            <div>
              <p className="font-semibold">English</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-400">
                Default Language
              </p>
            </div>

            <input
              type="radio"
              name="language"
              value="en"
              checked={language === "en"}
              onChange={(e) => onLanguageChange(e.target.value)}
            />
          </label>

          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 p-4 hover:border-blue-500 dark:border-slate-700 dark:hover:border-blue-400">
            <div>
              <p className="font-semibold">বাংলা</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Bengali
              </p>
            </div>

            <input
              type="radio"
              name="language"
              value="bn"
              checked={language === "bn"}
              onChange={(e) => onLanguageChange(e.target.value)}
            />
          </label>

          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 p-4 hover:border-blue-500 dark:border-slate-700 dark:hover:border-blue-400">
            <div>
              <p className="font-semibold">हिन्दी</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Hindi
              </p>
            </div>

            <input
              type="radio"
              name="language"
              value="hi"
              checked={language === "hi"}
              onChange={(e) => onLanguageChange(e.target.value)}
            />
          </label>
        </div>
      </div>

      {/* Theme */}

      <div>
        <h3 className="mb-4 text-lg font-semibold">🎨 Appearance</h3>

        <div className="space-y-3">
          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 p-4 hover:border-blue-500 dark:border-slate-700 dark:hover:border-blue-400">
            <div>
              <p className="font-semibold">System Default</p>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Follow your device theme
              </p>
            </div>

            <input
              type="radio"
              name="theme"
              value="system"
              checked={theme === "system"}
              onChange={() => {
                setTheme("system");
                onThemeChange("system");
              }}
            />
          </label>

          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 p-4 hover:border-blue-500 dark:border-slate-700 dark:hover:border-blue-400">
            <div>
              <p className="font-semibold">Light</p>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Bright appearance
              </p>
            </div>

            <input
              type="radio"
              name="theme"
              value="light"
              checked={theme === "light"}
              onChange={() => {
                setTheme("light");
                onThemeChange("light");
              }}
            />
          </label>

          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 p-4 hover:border-blue-500 dark:border-slate-700 dark:hover:border-blue-400">
            <div>
              <p className="font-semibold">Dark</p>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Dark appearance
              </p>
            </div>

            <input
              type="radio"
              name="theme"
              value="dark"
              checked={theme === "dark"}
              onChange={() => {
                setTheme("dark");
                onThemeChange("dark");
              }}
            />
          </label>
        </div>
      </div>
      
    </div>
  );
}
