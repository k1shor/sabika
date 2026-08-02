"use client";

export default function UsersPagination({ page, totalPages, disabled, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-between gap-4">
      <button
        type="button"
        disabled={page <= 1 || disabled}
        onClick={() => onPageChange(page - 1)}
        className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 disabled:opacity-40 dark:border-blue-400/20 dark:text-blue-100"
      >
        Previous
      </button>
      <span className="text-xs text-slate-500 dark:text-blue-100/50">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages || disabled}
        onClick={() => onPageChange(page + 1)}
        className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 disabled:opacity-40 dark:border-blue-400/20 dark:text-blue-100"
      >
        Next
      </button>
    </div>
  );
}
