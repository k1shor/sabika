"use client";

import { activityIcon, timeAgo } from "../utils/dashboardUtils";
import { IconJoin } from "../icons/icons";

export default function ActivityFeed({ items }) {
  if (!items?.length) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <IconJoin className="h-6 w-6 text-slate-300 dark:text-blue-100/20" />
        <p className="text-sm text-slate-400 dark:text-blue-100/30">Nothing has happened yet.</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      {items.map((item, index) => {
        const Icon = activityIcon(item.action);
        return (
          <div key={index} className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-slate-700 dark:text-blue-100/80">
                <span className="font-semibold">{item.name}</span>{" "}
                <span className="text-slate-500 dark:text-blue-100/50">{item.action}</span>
              </p>
            </div>
            <span className="shrink-0 text-xs text-slate-400 dark:text-blue-100/30">{timeAgo(item.time)}</span>
          </div>
        );
      })}
    </div>
  );
}