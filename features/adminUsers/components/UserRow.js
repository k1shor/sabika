"use client";

import { ROLES, roleLabel, roleColor, formatDate } from "../utils/userUtils";

export default function UserRow({
  user,
  isBusy,
  isCurrentUser,
  onUpdateRole,
  onToggleBan,
}) {
  return (
    <div className="grid gap-3 border-b border-slate-200 bg-white/80 p-4 last:border-b-0 dark:border-blue-400/20 dark:bg-blue-950/30 md:grid-cols-[1fr_auto] md:items-center">
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

      <div className="flex flex-wrap gap-2">
        <select
          value={user.role || "visitor"}
          disabled={isBusy || isCurrentUser}
          onChange={(e) => onUpdateRole(user._id, e.target.value)}
          className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-xs font-extrabold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 disabled:cursor-not-allowed disabled:opacity-60 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100"
        >
          {ROLES.map((role) => (
            <option key={role} value={role}>{roleLabel(role)}</option>
          ))}
        </select>

        <button
          type="button"
          disabled={isBusy || isCurrentUser}
          onClick={() => onToggleBan(user._id, user.isBanned)}
          className={`rounded-xl border px-3 py-2 text-xs font-extrabold transition disabled:cursor-not-allowed disabled:opacity-60
            ${user.isBanned
              ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-400/30 dark:bg-green-500/15 dark:text-green-100"
              : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-400/30 dark:bg-red-500/15 dark:text-red-100"
            }`}
        >
          {isBusy ? "..." : user.isBanned ? "Unban" : "Ban"}
        </button>
      </div>
    </div>
  );
}
