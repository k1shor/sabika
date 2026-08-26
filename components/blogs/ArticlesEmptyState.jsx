"use client";

import Link from "next/link";

export default function ArticlesEmptyState({ hasNoApprovedPosts, hasActiveFilter, onClear }) {
  return (
    <div className="mt-6 rounded-3xl border border-slate-200 bg-white/70 p-10 text-center shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
      <div className="mb-3 text-3xl font-black tracking-tight text-slate-300">
        {hasNoApprovedPosts ? "POST" : "SEARCH"}
      </div>
      <div className="text-lg font-extrabold text-slate-900 dark:text-white">
        {hasNoApprovedPosts ? "No approved articles yet" : "No articles found"}
      </div>
      <div className="mt-2 text-sm text-slate-600 dark:text-blue-100/75">
        {hasNoApprovedPosts
          ? "Articles appear here after an approved writer or admin publishes them and the post status is approved."
          : "Try a different keyword, category, or clear filters."}
      </div>
      {hasNoApprovedPosts && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Link href="/writers/posts" className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-blue-700">
            Write article
          </Link>
          <Link href="/admin/dashboard/posts" className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100">
            Review posts
          </Link>
        </div>
      )}
      {hasActiveFilter && (
        <button onClick={onClear} className="mt-4 rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-blue-700">
          Clear filters
        </button>
      )}
    </div>
  );
}
