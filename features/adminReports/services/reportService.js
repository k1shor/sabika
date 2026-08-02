export async function fetchReports({ page = 1, status = "", targetType = "" } = {}) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", "25");
  if (status) params.set("status", status);
  if (targetType) params.set("targetType", targetType);

  const res = await fetch(`/api/admin/reports?${params}`, { cache: "no-store" });
  return res.json().catch(() => null);
}

export async function updateReport(id, { status, adminNotes = "" }) {
  const res = await fetch(`/api/admin/reports/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, adminNotes }),
  });
  return res.json().catch(() => null);
}
