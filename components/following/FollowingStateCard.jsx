"use client";

export default function FollowingStateCard({ children }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/70 p-7 text-sm font-semibold text-slate-600 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25 dark:text-blue-100/70">
      {children}
    </div>
  );
}
