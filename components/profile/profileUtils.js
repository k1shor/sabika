export const TABS_BY_ROLE = {
  admin: ["Profile", "Password"],
  blog_writer: ["Profile", "My Articles", "Password"],
  visitor: ["Profile", "Password"],
};

export const STATUS_FILTERS = ["all", "approved", "pending", "draft"];

export function getInitials(name) {
  if (!name) return "U";
  return name.trim().split(/\s+/).map((word) => word[0]).join("").slice(0, 2).toUpperCase();
}

export function getRoleLabel(role) {
  if (role === "admin") return "System Admin";
  if (role === "blog_writer") return "Blog Writer";
  return "Visitor";
}

export function getRoleColor(role) {
  if (role === "admin") {
    return "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-400/20";
  }
  if (role === "blog_writer") {
    return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-400/20";
  }
  return "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-600/20";
}

export function statusStyle(status) {
  if (status === "approved") {
    return "bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-400/20";
  }
  if (status === "pending") {
    return "bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-300 dark:border-yellow-400/20";
  }
  return "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-600/20";
}

export function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
