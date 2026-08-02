"use client";

import { useEffect, useState } from "react";
import { fetchUsers, updateUserRole, toggleUserBan } from "../services/userService";
import { roleLabel } from "../utils/userUtils";
import UserSearchBar from "./UserSearchBar";
import UsersList from "./UsersList";
import UsersPagination from "./UsersPagination";

export default function AdminUsersPanel({ currentUserId = null }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = async (search = query, p = page) => {
    setLoading(true);
    setMsg(null);
    try {
      const data = await fetchUsers({ query: search, page: p });
      if (!data?.ok) {
        setMsg(data?.error || "Failed to load users");
        setUsers([]);
        return;
      }
      setUsers(Array.isArray(data.users) ? data.users : []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {
      setMsg("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      if (!data?.ok) {
        setMsg(data?.error || "Failed to update role");
        return;
      }
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
      if (!data?.ok) {
        setMsg(data?.error || "Failed");
        return;
      }
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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            User Accounts
          </h2>
          <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-blue-100/70">
            Search users, change roles, and manage account access.
          </p>
        </div>
        <UserSearchBar
          query={query}
          disabled={loading || Boolean(busyId)}
          onQueryChange={setQuery}
          onSearch={handleSearch}
          onRefresh={() => load(query, page)}
        />
      </div>

      {msg && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100/80">
          {msg}
        </div>
      )}

      {loading ? (
        <div className="mt-5 text-sm font-semibold text-slate-600 dark:text-blue-100/70">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="mt-5 text-sm font-semibold text-slate-600 dark:text-blue-100/70">No users found.</div>
      ) : (
        <>
          <UsersList
            users={users}
            busyId={busyId}
            currentUserId={currentUserId}
            onUpdateRole={updateRole}
            onToggleBan={toggleBan}
          />
          <UsersPagination
            page={page}
            totalPages={totalPages}
            disabled={loading}
            onPageChange={(nextPage) => {
              setPage(nextPage);
              load(query, nextPage);
            }}
          />
        </>
      )}
    </div>
  );
}
