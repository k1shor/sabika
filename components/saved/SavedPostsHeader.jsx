"use client";

export default function SavedPostsHeader({ loading, onRefresh }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Saved Blogs
        </h1>
        <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-blue-100/70">
          Blogs you bookmarked from article pages.
        </p>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={loading}
        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100"
      >
        Refresh
      </button>
    </div>
  );
}
