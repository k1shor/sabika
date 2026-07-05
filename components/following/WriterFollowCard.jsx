"use client";

import Link from "next/link";
import { initials } from "./followingUtils";

export default function WriterFollowCard({ writer, onUnfollow }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/70 p-5 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-extrabold text-blue-700 dark:bg-blue-900/50 dark:text-blue-200">
            {initials(writer.name)}
          </div>
          <div className="min-w-0">
            <Link href={`/writers/${writer._id}`} className="block truncate text-base font-extrabold text-slate-900 hover:text-blue-700 dark:text-white dark:hover:text-blue-300">
              {writer.name || "Unnamed writer"}
            </Link>
            <p className="mt-1 truncate text-xs font-semibold text-slate-500 dark:text-blue-100/60">
              {writer.email}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-extrabold text-blue-700 dark:bg-blue-500/15 dark:text-blue-100">
          {writer.writerStatus}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={`/writers/${writer._id}`} className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-xs font-extrabold text-slate-700 transition hover:bg-white dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100">
          View Profile
        </Link>
        <button
          type="button"
          onClick={() => onUnfollow(writer._id)}
          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-extrabold text-red-700 transition hover:bg-red-100 dark:border-red-400/30 dark:bg-red-500/15 dark:text-red-200"
        >
          Unfollow
        </button>
      </div>
    </div>
  );
}
