export const ROLES = ["visitor", "blog_writer", "admin"];

export function roleLabel(role) {
  if (role === "admin") return "Admin";
  if (role === "blog_writer") return "Blog Writer";
  return "Visitor";
}

export function roleColor(role) {
  if (role === "admin") return "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-200";
  if (role === "blog_writer") return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200";
  return "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-100";
}

export function formatDate(value) {
  const date = new Date(value || 0);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString();
}