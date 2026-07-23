// Client-side service layer for the admin users feature.

export async function fetchUsers({ query = "", page = 1 } = {}) {
    const qs = new URLSearchParams();
    if (query.trim()) qs.set("q", query.trim());
    qs.set("page", String(page));
  
    const res = await fetch(`/api/admin/users?${qs}`, { cache: "no-store" });
    return res.json().catch(() => null);
  }
  
  export async function updateUserRole(id, role) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    return res.json().catch(() => null);
  }
  
  export async function toggleUserBan(id, isBanned) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isBanned: !isBanned }),
    });
    return res.json().catch(() => null);
  }