import { CATEGORY_OPTIONS } from "@/components/posts/postFormUtils";

export const STATUS_FILTERS = ["all", "approved", "pending", "rejected"];

export const CATEGORY_LABELS = Object.fromEntries(
  CATEGORY_OPTIONS.map((o) => [o.value, o.label])
);

export function formatDate(value) {
  const date = new Date(value || 0);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function statusStyle(status) {
  if (status === "approved") return "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-200";
  if (status === "pending")  return "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-200";
  if (status === "rejected") return "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-200";
  return "bg-slate-100 text-slate-600";
}