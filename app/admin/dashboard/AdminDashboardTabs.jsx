"use client";

import { useState } from "react";
import Link from "next/link";
import AdminPostsPanel from "@/app/admin/posts/AdminPostsPanel";
import AdminUsersPanel from "@/app/admin/users/AdminUsersPanel";
import WriterRequestsTable from "./WriterRequestsTable";

// ─── Icons ────────────────────────────────────────────────────────────────────

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const FileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
);
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const BanIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
  </svg>
);
const GridIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, color }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-500 dark:text-blue-100/60 truncate">{label}</p>
        <p className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">{value ?? "—"}</p>
      </div>
    </div>
  );
}

// ─── Charts ───────────────────────────────────────────────────────────────────

function LineChart({ data }) {
  if (!data?.length) return (
    <div className="flex h-32 items-center justify-center text-sm text-slate-400">No data yet</div>
  );
  const max = Math.max(...data.map((d) => d.count), 1);
  const w = 400; const h = 120; const pad = 10;
  const points = data.map((d, i) => ({
    x: pad + (i / Math.max(data.length - 1, 1)) * (w - pad * 2),
    y: h - pad - ((d.count / max) * (h - pad * 2)),
  }));
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${path} L ${points.at(-1).x} ${h} L ${points[0].x} ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-32">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.18"/>
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill="url(#lg)"/>
      <path d={path} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {points.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#2563eb"/>)}
    </svg>
  );
}

function BarChart({ data, color = "#22c55e" }) {
  if (!data?.length) return (
    <div className="flex h-32 items-center justify-center text-sm text-slate-400">No data yet</div>
  );
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-1.5 h-32 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <div className="w-full rounded-t-md" style={{ height: `${(d.count / max) * 100}%`, background: color, minHeight: 4 }}/>
          <span className="text-[9px] text-slate-400 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Activity Feed ────────────────────────────────────────────────────────────

function timeAgo(date) {
  if (!date) return "";
  const diff  = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function ActivityFeed({ items }) {
  if (!items?.length) return (
    <p className="text-sm text-slate-400 text-center py-4">No recent activity.</p>
  );
  return (
    <div className="flex flex-col gap-4">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
            {item.name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-700 dark:text-blue-100/80">
              <span className="font-semibold">{item.name}</span>{" "}
              <span className="text-slate-500 dark:text-blue-100/50">{item.action}</span>
            </p>
          </div>
          <span className="shrink-0 text-xs text-slate-400">{timeAgo(item.time)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

const TABS = [
  { id: "overview",  label: "Overview",     icon: <GridIcon /> },
  { id: "posts",     label: "Posts",        icon: <FileIcon /> },
  { id: "users",     label: "Users",        icon: <UsersIcon /> },
  { id: "writers",   label: "Requests",     icon: <EditIcon /> },
];

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminDashboardTabs({
  stats,
  postsPerDay,
  usersPerWeek,
  activity,
  writerRequests,
  pendingWriters,
  currentUserId,
  user,
}) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">

      {/* Top bar */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-blue-400/20 dark:bg-slate-950/90">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                {user?.name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "A"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 dark:text-white leading-none truncate">{user?.name || "Admin"}</p>
                <p className="text-[10px] text-slate-400">Administrator</p>
              </div>
            </div>
            <Link href="/"
              className="shrink-0 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition dark:border-blue-400/20 dark:text-blue-100 dark:hover:bg-blue-950/40">
              ← Site
            </Link>
          </div>

          {/* Tabs — scrollable on mobile */}
          <div className="flex gap-0 -mb-px overflow-x-auto scrollbar-none">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-1.5 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap
                  ${activeTab === tab.id
                    ? "border-blue-600 text-blue-700 dark:border-blue-400 dark:text-blue-300"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:text-blue-100/50 dark:hover:text-blue-100/80"
                  }`}
              >
                {tab.icon}
                {tab.label}
                {tab.id === "writers" && pendingWriters > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                    {pendingWriters}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">

        {/* ── Overview ── */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-6">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Admin Dashboard
            </h1>

            {/* Stat cards — 2 cols on mobile, 5 on large */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              <StatCard label="Total Users"     value={stats.totalUsers}     color="bg-blue-50 text-blue-600 dark:bg-blue-950/40"       icon={<UsersIcon />} />
              <StatCard label="Total Blogs"     value={stats.totalPosts}     color="bg-green-50 text-green-600 dark:bg-green-950/40"    icon={<FileIcon />} />
              <StatCard label="Pending Writers" value={stats.pendingWriters} color="bg-yellow-50 text-yellow-600 dark:bg-yellow-950/40" icon={<EditIcon />} />
              <StatCard label="Flagged Posts"   value={stats.flaggedPosts}   color="bg-orange-50 text-orange-600 dark:bg-orange-950/40" icon={<AlertIcon />} />
              <StatCard label="Banned Users"    value={stats.bannedUsers}    color="bg-red-50 text-red-600 dark:bg-red-950/40"          icon={<BanIcon />} />
            </div>

            {/* Charts + Activity — stack on mobile */}
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
                <p className="text-sm font-extrabold text-slate-800 dark:text-white mb-4">Posts Per Day</p>
                <LineChart data={postsPerDay} />
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
                <p className="text-sm font-extrabold text-slate-800 dark:text-white mb-4">New Users Per Week</p>
                <BarChart data={usersPerWeek} />
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
                <p className="text-sm font-extrabold text-slate-800 dark:text-white mb-4">Recent Activity</p>
                <ActivityFeed items={activity} />
              </div>
            </div>

            {/* Quick actions — 2 cols on mobile */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Manage Posts",     tab: "posts",   color: "bg-blue-600 hover:bg-blue-700"     },
                { label: "Manage Users",     tab: "users",   color: "bg-slate-700 hover:bg-slate-800"   },
                { label: "Writer Requests",  tab: "writers", color: "bg-yellow-500 hover:bg-yellow-600" },
                { label: "Contact Messages", href: "/admin/contact-messages", color: "bg-green-600 hover:bg-green-700" },
              ].map((action) => (
                action.href ? (
                  <Link key={action.label} href={action.href}
                    className={`flex items-center justify-center rounded-xl px-3 py-3 text-xs sm:text-sm font-bold text-white transition text-center ${action.color}`}>
                    {action.label}
                  </Link>
                ) : (
                  <button key={action.label} onClick={() => setActiveTab(action.tab)}
                    className={`flex items-center justify-center rounded-xl px-3 py-3 text-xs sm:text-sm font-bold text-white transition ${action.color}`}>
                    {action.label}
                  </button>
                )
              ))}
            </div>
          </div>
        )}

        {/* ── Manage Posts ── */}
        {activeTab === "posts" && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Manage Posts</h2>
            <AdminPostsPanel />
          </div>
        )}

        {/* ── Manage Users ── */}
        {activeTab === "users" && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Manage Users</h2>
            <AdminUsersPanel currentUserId={currentUserId} />
          </div>
        )}

        {/* ── Writer Requests ── */}
        {activeTab === "writers" && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Writer Requests</h2>
            <WriterRequestsTable initialWriters={writerRequests} />
          </div>
        )}

      </div>
    </div>
  );
}