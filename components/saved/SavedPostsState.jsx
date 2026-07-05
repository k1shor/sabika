"use client";

export function SavedPostsLoading() {
  return (
    <div className="mt-6 text-sm font-semibold text-slate-500 dark:text-blue-100/60">
      Loading saved blogs...
    </div>
  );
}

export function SavedPostsMessage({ children }) {
  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100">
      {children}
    </div>
  );
}

export function SavedPostsEmpty() {
  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-600 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100/70">
      No saved blogs yet.
    </div>
  );
}
