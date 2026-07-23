"use client";

import { useEffect, useState } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { fetchUsers, updateUserRole, toggleUserBan } from "../services/userService";
import { ROLES, roleLabel, roleColor, formatDate } from "../utils/userUtils";

export default function AdminUsersPanel({ currentUserId = null }) {
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId]   = useState(null);
  const [msg, setMsg]         = useState(null);
  const [query, setQuery]     = useState("");
  const [page, setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = async (search = query, p = page) => {
    setLoading(true);
    setMsg(null);
    try {
      const data = await fetchUsers({ query: search, page: p });
      if (!data?.ok) { setMsg(data?.error || "Failed to load users"); setUsers([]); return; }
      setUsers(Array.isArray(data.users) ? data.users : []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {
      setMsg("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load(query, 1);
  };

  const updateRole = async (id, role) => {
    setBusyId(id);
    setMsg(null);
    try {
      const data = await updateUserRole(id, role);
      if (!data?.ok) { setMsg(data?.error || "Failed to update role"); return; }
      setUsers((list) => list.map((u) => (u._id === id ? { ...u, ...data.user } : u)));
      setMsg(`Role changed to ${roleLabel(role)}.`);
    } catch {
      setMsg("Failed to update role");
    } finally {
      setBusyId(null);
    }
  };

  const toggleBan = async (id, isBanned) => {
    setBusyId(id);
    setMsg(null);
    try {
      const data = await toggleUserBan(id, isBanned);
      if (!data?.ok) { setMsg(data?.error || "Failed"); return; }
      setUsers((list) => list.map((u) => (u._id === id ? { ...u, ...data.user } : u)));
      setMsg(!isBanned ? "User banned." : "User unbanned.");
    } catch {
      setMsg("Failed to update user");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            User Accounts
          </h2>
          <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-blue-100/70">
            Search users, change roles, and manage account access.
          </p>
        </div>
        <form onSubmit={handleSearch} className="flex w-full gap-2 lg:max-w-md">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, or role"
          />
          <Button type="submit" disabled={loading || Boolean(busyId)}>Search</Button>
          <Button type="button" disabled={loading || Boolean(busyId)} onClick={() => load(query, page)}>
            Refresh
          </Button>
        </form>
      </div>

      {/* Message */}
      {msg && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100/80">
          {msg}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="mt-5 text-sm font-semibold text-slate-600 dark:text-blue-100/70">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="mt-5 text-sm font-semibold text-slate-600 dark:text-blue-100/70">No users found.</div>
      ) : (
        <>
          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 dark:border-blue-400/20">
            {users.map((user) => {
              const isCurrentUser = user._id === currentUserId;
              const isBusy = busyId === user._id;

              return (
                <div
                  key={user._id}
                  className="grid gap-3 border-b border-slate-200 bg-white/80 p-4 last:border-b-0 dark:border-blue-400/20 dark:bg-blue-950/30 md:grid-cols-[1fr_auto] md:items-center"
                >
                  {/* User info */}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-extrabold text-slate-900 dark:text-white">
                        {user.name || "Unnamed user"}
                      </span>
                      <span className={`rounded-full px-2 py-1 text-xs font-extrabold ${roleColor(user.role)}`}>
                        {roleLabel(user.role)}
                      </span>
                      {user.isBanned && (
                        <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-700 dark:bg-red-500/15 dark:text-red-200">
                          Banned
                        </span>
                      )}
                      {isCurrentUser && (
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600 dark:bg-blue-950/50 dark:text-blue-100/70">
                          You
                        </span>
                      )}
                    </div>
                    <div className="mt-1 truncate text-xs font-semibold text-slate-600 dark:text-blue-100/70">
                      {user.email}
                    </div>
                    <div className="mt-1 text-xs font-semibold text-slate-500 dark:text-blue-100/50">
                      Joined {formatDate(user.createdAt)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {/* Role select */}
                    <select
                      value={user.role || "visitor"}
                      disabled={isBusy || isCurrentUser}
                      onChange={(e) => updateRole(user._id, e.target.value)}
                      className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-xs font-extrabold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 disabled:cursor-not-allowed disabled:opacity-60 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100"
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>{roleLabel(role)}</option>
                      ))}
                    </select>

                    {/* Ban button */}
                    <button
                      type="button"
                      disabled={isBusy || isCurrentUser}
                      onClick={() => toggleBan(user._id, user.isBanned)}
                      className={`rounded-xl border px-3 py-2 text-xs font-extrabold transition disabled:cursor-not-allowed disabled:opacity-60
                        ${user.isBanned
                          ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-400/30 dark:bg-green-50/15 dark:text-white-200"
                          : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-400/30 dark:bg-red-450/15 dark:text-white-200"
                        }`}
                    >
                      {isBusy ? "..." : user.isBanned ? "Unban" : "Ban"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between gap-4">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => { setPage(page - 1); load(query, page - 1); }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold disabled:opacity-40 dark:border-blue-400/20"
              >
                ← Previous
              </button>
              <span className="text-xs text-slate-500 dark:text-blue-100/50">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => { setPage(page + 1); load(query, page + 1); }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold disabled:opacity-40 dark:border-blue-400/20"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}