export const AUDIT_ACTIONS = [
  "",
  "admin_user_updated",
  "admin_post_created",
  "admin_post_updated",
  "admin_post_deleted",
  "writer_application_approved",
  "writer_application_rejected",
];

export const AUDIT_TARGET_TYPES = ["", "user", "post", "writer_application"];

export function auditLabel(value) {
  if (!value) return "All";
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatAuditDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}
