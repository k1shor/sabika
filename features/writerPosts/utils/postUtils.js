export function statusBadge(status) {
  if (status === "approved") return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400";
  if (status === "pending")  return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400";
  if (status === "rejected") return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400";
  if (status === "draft")    return "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400";
  return "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400";
}

export function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}