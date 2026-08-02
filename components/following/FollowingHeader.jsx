"use client";

import Button from "@/components/Button";

export default function FollowingHeader({ loading, onRefresh }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/70 p-7 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-sm font-semibold text-slate-600 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100/80">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            Visitor
          </div>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            People You Follow
          </h1>
          <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-blue-100/70">
            These are the approved writers whose new posts will appear in your notifications.
          </p>
        </div>
        <Button type="button" disabled={loading} onClick={onRefresh}>
          Refresh
        </Button>
      </div>
    </div>
  );
}
