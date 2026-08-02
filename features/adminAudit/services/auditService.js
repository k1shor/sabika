export async function fetchAuditLogs({ page = 1, query = "", action = "", targetType = "" } = {}) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", "25");
  if (query.trim()) params.set("q", query.trim());
  if (action) params.set("action", action);
  if (targetType) params.set("targetType", targetType);

  const res = await fetch(`/api/admin/audit-logs?${params}`, { cache: "no-store" });
  return res.json().catch(() => null);
}
