export async function fetchAdminPosts({ q, status, flagged, page } = {}) {
  const qs = new URLSearchParams();
  if (q && q.trim())              qs.set("q", q.trim());
  if (status && status !== "all") qs.set("status", status);
  if (flagged)                    qs.set("flagged", "true");
  if (page)                       qs.set("page", String(page));

  const res  = await fetch(`/api/admin/posts?${qs}`, { cache: "no-store" });
  return res.json().catch(() => null);
}

export async function createAdminPost(payload) {
  const res  = await fetch("/api/admin/posts", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload),
  });
  return res.json().catch(() => null);
}

// Alias -- CreatePostForm.js may still import this under the older
// name. Keeping both so neither file breaks regardless of which one
// gets updated first.
export { createAdminPost as createOfficialPost };

export async function updateAdminPost(id, body) {
  const res  = await fetch(`/api/admin/posts/${id}`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
  return res.json().catch(() => null);
}

export async function deleteAdminPost(id) {
  const res  = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
  return res.json().catch(() => null);
}