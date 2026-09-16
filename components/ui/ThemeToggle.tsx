"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "@teispace/next-themes";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);

  // =========================================
  // Mounted
  // =========================================

  useEffect(() => {
    setMounted(true);
  }, []);

  // =========================================
  // Prevent Hydration Mismatch
  // =========================================

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Change theme"
        className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-full
          text-slate-600
          dark:text-slate-300
          sm:h-11
          sm:w-11
        "
      />
    );
  }

  // =========================================
  // Current Theme
  // =========================================

  const isDark = theme === "dark";

  // =========================================
  // Toggle Theme
  // =========================================

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  // =========================================
  // UI
  // =========================================

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={
        isDark ? "Switch to light theme" : "Switch to dark theme"
      }
      title={
        isDark ? "Switch to light theme" : "Switch to dark theme"
      }
      className="
        flex
        h-10
        w-10
        shrink-0
        items-center
        justify-center
        rounded-full
        text-slate-600
        transition-colors
        duration-150
        hover:bg-slate-100
        hover:text-[#1565d8]
        dark:text-slate-300
        dark:hover:bg-slate-800
        dark:hover:text-blue-400
        sm:h-11
        sm:w-11
      "
    >
      {isDark ? (
        <Moon
          size={20}
          strokeWidth={2}
        />
      ) : (
        <Sun
          size={20}
          strokeWidth={2}
          className="text-amber-500"
        />
      )}
    </button>
  );
}