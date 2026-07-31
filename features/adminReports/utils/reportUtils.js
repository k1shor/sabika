export const REPORT_STATUSES = ["", "open", "reviewed", "dismissed", "action_taken"];
export const REPORT_TARGET_TYPES = ["", "post", "writer"];

export function reportLabel(value) {
  if (!value) return "All";
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatReportDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}
