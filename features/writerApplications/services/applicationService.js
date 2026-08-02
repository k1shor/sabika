export async function fetchWriterApplications() {
  const res = await fetch("/api/admin/writer-applications", { cache: "no-store" });
  return res.json().catch(() => null);
}

export async function reviewWriterApplication(id, { status, rejectionReason = "" }) {
  const res = await fetch(`/api/admin/writer-applications/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, rejectionReason }),
  });
  return res.json().catch(() => null);
}
