"use client";

import { MoonIcon, SunIcon } from "./HeaderIcons";

export default function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white/80 text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-700 dark:border-blue-400/20 dark:bg-blue-950/50 dark:text-blue-100 dark:hover:bg-blue-950/70"
      aria-label="Toggle theme"
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
