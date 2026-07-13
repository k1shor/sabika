"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import WriterRequestsTable from "./WriterRequestsTable";

// ─── Icons (inline SVG) ─────────────────────────────────────────────────────

function IconPosts(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 4h9l5 5v11H6z" />
      <path d="M14 4v5h5" />
      <path d="M9 13h6M9 17h6M9 9h2" />
    </svg>
  );
}
function IconUsers(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M2 21c0-4 3-6 7-6s7 2 7 6" />
      <circle cx="17" cy="8" r="2.5" />
      <path d="M18 15c2.8.4 4 2.1 4 6" />
    </svg>
  );
}
function IconWriter(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}
function IconFlag(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 3v18" />
      <path d="M4 4h13l-2.5 4L17 12H4" />
    </svg>
  );
}
function IconBan(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M5.5 5.5l13 13" />
    </svg>
  );
}
function IconMail(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}
function IconHome(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}
function IconMenu(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}
function IconClose(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
function IconPost(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}
function IconJoin(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
    </svg>
  );
}

// ─── Nav config (single source used by both sidebar + mobile drawer) ───────

const NAV = [
  { label: "Dashboard",       href: "/admin/dashboard",           Icon: IconHome },
  { label: "Posts",           href: "/admin/posts",               Icon: IconPosts },
  { label: "Users",           href: "/admin/users/manage",        Icon: IconUsers },
  { label: "Writer Requests", href: "/admin/writer-applications", Icon: IconWriter },
  { label: "Contact",         href: "/admin/contact-messages",    Icon: IconMail },
];

// ─── Stat card ──────────────────────────────────────────────────────────────

const TONES = {
  blue:   { bar: "bg-blue-600",    icon: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" },
  green:  { bar: "bg-emerald-600", icon: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" },
  yellow: { bar: "bg-amber-500",   icon: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" },
  orange: { bar: "bg-orange-500",  icon: "bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300" },
  red:    { bar: "bg-red-600",     icon: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300" },
};

function StatCard({ label, value, tone, Icon, href }) {
  const t = TONES[tone || "blue"];
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-blue-400/20 dark:bg-blue-950/25"
    >
      <span className={`absolute left-0 top-0 h-full w-1 ${t.bar}`} />
      <div className="flex items-start justify-between pl-2">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-blue-100/60">{label}</p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{value ?? "-"}</p>
        </div>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition group-hover:scale-105 ${t.icon}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>
    </Link>
  );
}

// ─── Charts ─────────────────────────────────────────────────────────────────

function LineChart({ data }) {
  if (!data?.length) {
    return <div className="flex h-32 items-center justify-center text-sm text-slate-400 dark:text-blue-100/30">No data yet</div>;
  }
  const max = Math.max(...data.map((item) => item.count), 1);
  const width = 400, height = 120, pad = 10;
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
    return <div className="flex h-32 items-center justify-center text-sm text-slate-400 dark:text-blue-100/30">No data yet</div>;
  }
  const max = Math.max(...data.map((item) => item.count), 1);
  return (
    <div className="flex h-32 w-full items-end gap-1.5">
      {data.map((item, index) => (
        <div key={index} className="flex flex-1 flex-col items-center gap-1">
          <div className="w-full rounded-t-md bg-emerald-500 dark:bg-emerald-400/80" style={{ height: `${(item.count / max) * 100}%`, minHeight: 4 }} />
          <span className="w-full truncate text-center text-[9px] text-slate-400 dark:text-blue-100/40">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function ChartPanel({ title, total, totalLabel, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
      <div className="mb-4 flex items-baseline justify-between">
        <p className="text-sm font-extrabold text-slate-800 dark:text-white">{title}</p>
        {total != null && (
          <p className="text-xs font-semibold text-slate-400 dark:text-blue-100/40">
            <span className="text-sm font-extrabold text-slate-700 dark:text-blue-100">{total}</span> {totalLabel}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Activity feed with per-action icon instead of plain initials ─────────

function activityIcon(action) {
  if (action?.includes("writer")) return IconWriter;
  if (action?.includes("blog"))   return IconPost;
  return IconJoin;
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
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <IconJoin className="h-6 w-6 text-slate-300 dark:text-blue-100/20" />
        <p className="text-sm text-slate-400 dark:text-blue-100/30">Nothing has happened yet.</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      {items.map((item, index) => {
        const Icon = activityIcon(item.action);
        return (
          <div key={index} className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-slate-700 dark:text-blue-100/80">
                <span className="font-semibold">{item.name}</span>{" "}
                <span className="text-slate-500 dark:text-blue-100/50">{item.action}</span>
              </p>
            </div>
            <span className="shrink-0 text-xs text-slate-400 dark:text-blue-100/30">{timeAgo(item.time)}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Sidebar (desktop) + drawer (mobile) ───────────────────────────────────

function NavLinks({ pathname, onNavigate }) {
  return (
    <nav className="flex flex-col gap-1 px-3">
      {NAV.map(({ label, href, Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
              active
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 dark:text-blue-100/70 dark:hover:bg-blue-950/40"
            }`}
          >
            <Icon className="h-4.5 w-4.5 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white/70 py-6 dark:border-blue-400/20 dark:bg-blue-950/20 md:block">
      <NavLinks pathname={pathname} />
    </aside>
  );
}

function MobileNavDrawer({ open, onClose }) {
  const pathname = usePathname();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="absolute left-0 top-0 h-full w-64 bg-white py-6 shadow-xl dark:bg-slate-950">
        <div className="mb-4 flex items-center justify-between px-4">
          <p className="text-sm font-extrabold text-slate-800 dark:text-white">Admin Menu</p>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-blue-100/60 dark:hover:bg-blue-950/40">
            <IconClose className="h-4.5 w-4.5" />
          </button>
        </div>
        <NavLinks pathname={pathname} onNavigate={onClose} />
      </div>
    </div>
  );
}

// ─── Main ───────────────────────────────────────────────────────────────────

export default function AdminDashboardTabs({
  stats,
  postsPerDay,
  usersPerWeek,
  activity,
  writerRequests,
  user,
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const postsThisWeek = (postsPerDay || []).reduce((sum, d) => sum + d.count, 0);
  const usersThisPeriod = (usersPerWeek || []).reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur dark:border-blue-400/20 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 dark:border-blue-400/20 dark:text-blue-100 md:hidden"
              aria-label="Open menu"
            >
              <IconMenu className="h-4.5 w-4.5" />
            </button>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
              {user?.name?.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase() || "A"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold leading-none text-slate-800 dark:text-white">{user?.name || "Admin"}</p>
              <p className="text-[10px] text-slate-400 dark:text-blue-100/40">Administrator</p>
            </div>
          </div>
          <Link href="/" className="shrink-0 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-blue-400/20 dark:text-blue-100 dark:hover:bg-blue-950/40">
            Back to site
          </Link>
        </div>
      </div>

      <MobileNavDrawer open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <div className="mx-auto flex max-w-7xl">
        <Sidebar />

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6">
          <div className="grid gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Overview</p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-blue-100/50">
                A snapshot of the platform right now.
              </p>
            </div>

            <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              <StatCard label="Total Users" value={stats.totalUsers} tone="blue" Icon={IconUsers} href="/admin/users/manage" />
              <StatCard label="Total Blogs" value={stats.totalPosts} tone="green" Icon={IconPosts} href="/admin/posts" />
              <StatCard label="Pending Writers" value={stats.pendingWriters} tone="yellow" Icon={IconWriter} href="/admin/writer-applications" />
              <StatCard label="Flagged Posts" value={stats.flaggedPosts} tone="orange" Icon={IconFlag} href="/admin/posts" />
              <StatCard label="Banned Users" value={stats.bannedUsers} tone="red" Icon={IconBan} href="/admin/users/manage" />
            </section>

            <section className="grid gap-4 lg:grid-cols-3">
              <ChartPanel title="Posts Per Day" total={postsThisWeek} totalLabel="this week">
                <LineChart data={postsPerDay} />
              </ChartPanel>
              <ChartPanel title="New Users Per Week" total={usersThisPeriod} totalLabel="last 5 weeks">
                <BarChart data={usersPerWeek} />
              </ChartPanel>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
                <p className="mb-4 text-sm font-extrabold text-slate-800 dark:text-white">Recent Activity</p>
                <ActivityFeed items={activity} />
              </div>
            </section>

            <section>
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Needs your attention</p>
              <WriterRequestsTable initialWriters={writerRequests || []} />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}