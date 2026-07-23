"use client";

import Link from "next/link";

// Semantic status tones (approved/pending/flagged/banned) stay
// green/amber/orange/red -- that's standard, expected color coding for
// status, not a departure from the blue/red brand.
const TONES = {
  blue:   { bar: "bg-blue-600",    icon: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" },
  green:  { bar: "bg-emerald-600", icon: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" },
  yellow: { bar: "bg-amber-500",   icon: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" },
  orange: { bar: "bg-orange-500",  icon: "bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300" },
  red:    { bar: "bg-red-600",     icon: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300" },
};

export default function StatCard({ label, value, tone, Icon, href }) {
  const t = TONES[tone || "blue"];
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-blue-400/20 dark:bg-blue-950/25"
    >
      <span className={`absolute left-0 top-0 h-full w-1 ${t.bar}`} />
      <div className="flex items-start justify-between pl-2">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-blue-100/60">{label}</p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{value ?? "-"}</p>
        </div>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition group-hover:scale-105 ${t.icon}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>
    </Link>
  );
}