"use client";

import Link from "next/link";

function StatCard({ label, value, tone }) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200",
    green: "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-200",
    yellow: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-200",
    orange: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-200",
    red: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-200",
  }[tone || "blue"];

  return (
    <div className={`rounded-2xl border border-slate-200 p-4 shadow-sm dark:border-blue-400/20 ${toneClass}`}>
      <p className="text-xs font-semibold opacity-75">{label}</p>
      <p className="mt-1 text-3xl font-extrabold tracking-tight">{value ?? "-"}</p>
    </div>
  );
}

function LineChart({ data }) {
  if (!data?.length) {
    return <div className="flex h-32 items-center justify-center text-sm text-slate-400">No data yet</div>;
  }

  const max = Math.max(...data.map((item) => item.count), 1);
  const width = 400;
  const height = 120;
  const pad = 10;
  const points = data.map((item, index) => ({
    x: pad + (index / Math.max(data.length - 1, 1)) * (width - pad * 2),
    y: height - pad - (item.count / max) * (height - pad * 2),
  }));
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const area = `${path} L ${points.at(-1).x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-32 w-full">
      <defs>
        <linearGradient id="admin-posts-line" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#admin-posts-line)" />
      <path d={path} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r="3.5" fill="#2563eb" />)}
    </svg>
  );
}

function BarChart({ data }) {
  if (!data?.length) {
    return <div className="flex h-32 items-center justify-center text-sm text-slate-400">No data yet</div>;
  }

  const max = Math.max(...data.map((item) => item.count), 1);
  return (
    <div className="flex h-32 w-full items-end gap-1.5">
      {data.map((item, index) => (
        <div key={index} className="flex flex-1 flex-col items-center gap-1">
          <div className="w-full rounded-t-md bg-emerald-500" style={{ height: `${(item.count / max) * 100}%`, minHeight: 4 }} />
          <span className="w-full truncate text-center text-[9px] text-slate-400">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function timeAgo(value) {
  if (!value) return "";
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function ActivityFeed({ items }) {
  if (!items?.length) {
    return <p className="py-4 text-center text-sm text-slate-400">No recent activity.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
            {item.name?.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase() || "?"}
          </div>
          <div className="min-w-0 flex-1">
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

const ACTIONS = [
  { label: "Manage Posts", href: "/admin/posts", tone: "bg-blue-600 hover:bg-blue-700" },
  { label: "Manage Users", href: "/admin/users/manage", tone: "bg-slate-700 hover:bg-slate-800" },
  { label: "Writer Requests", href: "/admin/writer-applications", tone: "bg-yellow-500 hover:bg-yellow-600" },
  { label: "Contact Messages", href: "/admin/contact-messages", tone: "bg-green-600 hover:bg-green-700" },
];

export default function AdminDashboardTabs({
  stats,
  postsPerDay,
  usersPerWeek,
  activity,
  user,
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur dark:border-blue-400/20 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
              {user?.name?.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase() || "A"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold leading-none text-slate-800 dark:text-white">{user?.name || "Admin"}</p>
              <p className="text-[10px] text-slate-400">Administrator</p>
            </div>
          </div>
          <Link href="/" className="shrink-0 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-blue-400/20 dark:text-blue-100 dark:hover:bg-blue-950/40">
            Back to site
          </Link>
        </div>
      </div>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Admin Dashboard</h1>
          
        </div>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <StatCard label="Total Users" value={stats.totalUsers} tone="blue" />
          <StatCard label="Total Blogs" value={stats.totalPosts} tone="green" />
          <StatCard label="Pending Writers" value={stats.pendingWriters} tone="yellow" />
          <StatCard label="Flagged Posts" value={stats.flaggedPosts} tone="orange" />
          <StatCard label="Banned Users" value={stats.bannedUsers} tone="red" />
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
            <p className="mb-4 text-sm font-extrabold text-slate-800 dark:text-white">Posts Per Day</p>
            <LineChart data={postsPerDay} />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
            <p className="mb-4 text-sm font-extrabold text-slate-800 dark:text-white">New Users Per Week</p>
            <BarChart data={usersPerWeek} />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
            <p className="mb-4 text-sm font-extrabold text-slate-800 dark:text-white">Recent Activity</p>
            <ActivityFeed items={activity} />
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {ACTIONS.map((action) => (
            <Link key={action.href} href={action.href} className={`flex items-center justify-center rounded-xl px-3 py-3 text-center text-xs font-bold text-white transition sm:text-sm ${action.tone}`}>
              {action.label}
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
