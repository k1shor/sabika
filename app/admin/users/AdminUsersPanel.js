"use client";

import { useEffect, useState } from "react";
import Button from "@/components/Button";

function formatDate(value) {
  const date = new Date(value || 0);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString();
}

export default function AdminUsersPanel() {
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState(null);
 
  const load = async () => {
    setLoading(true);
    setMsg(null);

    const res = await fetch("/api/admin/users", { cache: "no-store" });
    const data = await res.json().catch(() => null);

    setLoading(false);

    if (!data?.ok) {
      setMsg(data?.error || "Failed to load users");
      setUsers([]);
      setCurrentUserId(null);
      return;
    }

    setUsers(Array.isArray(data.users) ? data.users : []);
    setCurrentUserId(data.currentUserId || null);
  };

  useEffect(() => {
    // Initial data sync from the admin API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const updateRole = async (id, role) => {
    setBusyId(id);
    setMsg(null);

    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });

    const data = await res.json().catch(() => null);
    setBusyId(null);

    if (!data?.ok) {
      setMsg(data?.error || "Failed to update user role");
      return;
    }

    setUsers((list) => list.map((user) => (user._id === id ? data.user : user)));
    setMsg(role === "admin" ? "User promoted to admin." : "Admin demoted to visitor.");
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            User Accounts
          </h2>
          <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-blue-100/70">
            New registrations start as users. Existing admins can promote trusted accounts.
          </p>
        </div>

        <Button type="button" disabled={loading || Boolean(busyId)} onClick={load}>
          Refresh
        </Button>
      </div>

      {msg && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100/80">
          {msg}
        </div>
      )}

      {loading ? (
        <div className="mt-5 text-sm font-semibold text-slate-600 dark:text-blue-100/70">
          Loading users...
        </div>
      ) : users.length === 0 ? (
        <div className="mt-5 text-sm font-semibold text-slate-600 dark:text-blue-100/70">
          No users found.
        </div>
      ) : (
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 dark:border-blue-400/20">
          <div className="grid gap-0">
            {users.map((user) => {
              const isCurrentUser = user._id === currentUserId;
              const isBusy = busyId === user._id;
              const nextRole = user.role === "admin" ? "visitor" : "admin";

              return (
                <div
                  key={user._id}
                  className="grid gap-3 border-b border-slate-200 bg-white/80 p-4 last:border-b-0 dark:border-blue-400/20 dark:bg-blue-950/30 md:grid-cols-[1fr_auto] md:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="truncate text-sm font-extrabold text-slate-900 dark:text-white">
                        {user.name || "Unnamed user"}
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-extrabold ${
                          user.role === "admin"
                            ? "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-200"
                            : "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-100"
                        }`}
                      >
                        {user.role === "admin" ? "Admin" : "User"}
                      </span>
                      {isCurrentUser ? (
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600 dark:bg-blue-950/50 dark:text-blue-100/70">
                          You
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-1 truncate text-xs font-semibold text-slate-600 dark:text-blue-100/70">
                      {user.email}
                    </div>
                    <div className="mt-1 text-xs font-semibold text-slate-500 dark:text-blue-100/50">
                      Joined {formatDate(user.createdAt)}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isBusy || (isCurrentUser && nextRole === "visitor")}
                    onClick={() => updateRole(user._id, nextRole)}
                    className={`rounded-xl border px-3 py-2 text-xs font-extrabold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      user.role === "admin"
                        ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100 dark:hover:bg-blue-950/45"
                        : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-400/30 dark:bg-red-500/15 dark:text-red-200 dark:hover:bg-red-500/25"
                    }`}
                  >
                    {isBusy
                      ? "Saving..."
                      : user.role === "admin"
                        ? "Demote to Visitor"
                        : "Promote to Admin"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
// const roles = ["visitor", "blog_writer", "admin"];
// <select
//   value={user.role}
//   onChange={(e) => updateRole(user._id, e.target.value)}
//   disabled={isBusy}
// >
//   <option value="visitor">Visitor</option>
//   <option value="blog_writer">Blog Writer</option>
//   <option value="admin">Admin</option>
// </select>