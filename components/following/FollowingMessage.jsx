"use client";

export default function FollowingMessage({ children }) {
  if (!children) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100/80">
      {children}
    </div>
  );
}
