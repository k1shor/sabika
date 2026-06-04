import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { Post } from "@/models/Post";
import AdminPostsPanel from "@/app/admin/posts/AdminPostsPanel";
import AdminUsersPanel from "@/app/admin/users/AdminUsersPanel";
import WriterRequestsTable from "./WriterRequestsTable";

export const dynamic = "force-dynamic";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Icons ────────────────────────────────────────────────────────────────────

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const FileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
);
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const BanIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
  </svg>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, color }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-500 dark:text-blue-100/60">{label}</p>
        <p className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{value ?? "—"}</p>
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

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function NavIcon({ name }) {
  const cls = "opacity-60";
  if (name === "grid")  return <svg className={cls} xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
  if (name === "edit")  return <svg className={cls} xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
  if (name === "users") return <svg className={cls} xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
  if (name === "file")  return <svg className={cls} xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
  if (name === "mail")  return <svg className={cls} xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
  return null;
}

function AdminSidebar({ pendingCount, user }) {
  const items = [
    { label: "Dashboard",        href: "/admin/dashboard",           icon: "grid" },
    { label: "Writer Requests",  href: "/admin/writer-applications", icon: "edit", badge: pendingCount },
    { label: "Manage Users",     href: "/admin/dashboard#users",     icon: "users" },
    { label: "Manage Posts",     href: "/admin/dashboard#posts",     icon: "file" },
    { label: "Contact Messages", href: "/admin/contact-messages",    icon: "mail" },
  ];
  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col justify-between border-r border-slate-200 bg-white dark:border-blue-400/20 dark:bg-slate-950 min-h-screen sticky top-0">
      <div>
        <div className="px-5 py-5 border-b border-slate-100 dark:border-blue-400/10">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-blue-100/30">Admin Panel</p>
        </div>
        <nav className="p-3 flex flex-col gap-0.5">
          {items.map((item) => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition dark:text-blue-100/70 dark:hover:bg-blue-950/40">
              <NavIcon name={item.icon}/>
              <span className="flex-1">{item.label}</span>
              {item.badge > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-slate-100 dark:border-blue-400/10 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
            {user?.name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "A"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user?.name || "Admin"}</p>
            <p className="text-xs text-slate-400">Administrator</p>
          </div>
        </div>
        <Link href="/" className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-3 py-2 text-xs font-bold text-white hover:bg-red-600 transition">
          ← Back to Site
        </Link>
      </div>
    </aside>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default async function AdminDashboardPage() {
  const auth = await requireAdmin();
  if (!auth.ok) redirect("/login?next=/admin/dashboard");

  await dbConnect();

  const sevenDaysAgo = new Date(Date.now() - 7  * 24 * 60 * 60 * 1000);
  const fiveWeeksAgo = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    bannedUsers,
    totalPosts,
    pendingWriters,
    flaggedPosts,
    postsPerDayRaw,
    usersPerWeekRaw,
    writerRequestsRaw,
    recentUsersRaw,
    recentPostsRaw,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isBanned: true }),
    Post.countDocuments(),
    User.countDocuments({ "writerVerification.status": "pending" }),
    Post.countDocuments({ isFlagged: true }),
    Post.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    User.aggregate([
      { $match: { createdAt: { $gte: fiveWeeksAgo } } },
      { $group: { _id: { $week: "$createdAt" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    User.find(
      { "writerVerification.status": "pending" },
      { name: 1, email: 1, writerVerification: 1 }
    ).sort({ "writerVerification.submittedAt": -1 }).limit(10).lean(),
    User.find({}, { name: 1, createdAt: 1, "writerVerification.status": 1 })
      .sort({ createdAt: -1 }).limit(5).lean(),
    Post.find({}, { title: 1, authorId: 1, createdAt: 1 })
      .populate("authorId", "name")
      .sort({ createdAt: -1 }).limit(5).lean(),
    // ✅ NO unlimited User.find() here anymore — AdminUsersPanel fetches its own data
  ]);

  // ── Chart data ────────────────────────────────────────────────────────────
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const postsPerDay = postsPerDayRaw.map((d) => ({
    count: d.count,
    label: dayNames[new Date(d._id).getDay()],
  }));
  const usersPerWeek = usersPerWeekRaw.map((d, i) => ({
    count: d.count,
    label: `W${i + 1}`,
  }));

  // ── Activity feed ─────────────────────────────────────────────────────────
  const activity = [
    ...recentUsersRaw.map((u) => ({
      name:   u.name || "Unknown",
      action: u.writerVerification?.status === "pending"
        ? "requested to become a writer"
        : "joined the platform",
      time: u.createdAt,
    })),
    ...recentPostsRaw.map((p) => ({
      name:   p.authorId?.name || "Unknown",
      action: "published a new blog",
      time:   p.createdAt,
    })),
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);

  // ── Writer requests ───────────────────────────────────────────────────────
  const writerRequests = writerRequestsRaw.map((u) => ({
    _id:         String(u._id),
    name:        u.name  || "",
    email:       u.email || "",
    category:    u.writerVerification?.category    || "",
    workplace:   u.writerVerification?.workplace   || "—",
    licenseNo:   u.writerVerification?.licenseNo   || "—",
    documentUrl: u.writerVerification?.documentUrl || "",
    submittedAt: u.writerVerification?.submittedAt
      ? new Date(u.writerVerification.submittedAt).toISOString()
      : null,
  }));

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminSidebar pendingCount={pendingWriters} user={auth.user} />

      <div className="flex-1 min-w-0 flex flex-col">

        {/* Top nav */}
        <div className="sticky top-0 z-30 flex items-center gap-6 border-b border-slate-200 bg-white/80 backdrop-blur px-6 py-3 dark:border-blue-400/20 dark:bg-slate-950/80">
          <span className="text-sm font-bold text-blue-700 border-b-2 border-blue-600 pb-0.5">Dashboard</span>
          <Link href="/admin/writer-applications" className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-blue-100/60">
            Writer Requests
            {pendingWriters > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                {pendingWriters}
              </span>
            )}
          </Link>
          <Link href="/admin/dashboard#users" className="text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-blue-100/60">Manage Users</Link>
          <Link href="/admin/dashboard#posts" className="text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-blue-100/60">Manage Posts</Link>
          <Link href="/admin/contact-messages" className="text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-blue-100/60">Contact Messages</Link>
          <div className="ml-auto">
            <Link href="/" className="rounded-xl border border-slate-200 px-4 py-1.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition dark:border-blue-400/20 dark:text-blue-100">
              Back to Site
            </Link>
          </div>
        </div>

        <main className="flex-1 p-6 grid gap-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Admin Dashboard
          </h1>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard label="Total Users"     value={totalUsers}     color="bg-blue-50 text-blue-600 dark:bg-blue-950/40"       icon={<UsersIcon />} />
            <StatCard label="Total Blogs"     value={totalPosts}     color="bg-green-50 text-green-600 dark:bg-green-950/40"    icon={<FileIcon />} />
            <StatCard label="Pending Writers" value={pendingWriters} color="bg-yellow-50 text-yellow-600 dark:bg-yellow-950/40" icon={<EditIcon />} />
            <StatCard label="Flagged Posts"   value={flaggedPosts}   color="bg-orange-50 text-orange-600 dark:bg-orange-950/40" icon={<AlertIcon />} />
            <StatCard label="Banned Users"    value={bannedUsers}    color="bg-red-50 text-red-600 dark:bg-red-950/40"          icon={<BanIcon />} />
          </div>

          {/* Charts + Activity */}
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
              <p className="text-sm font-extrabold text-slate-800 dark:text-white mb-4">Posts Per Day</p>
              <LineChart data={postsPerDay} />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
              <p className="text-sm font-extrabold text-slate-800 dark:text-white mb-4">New Users Per Week</p>
              <BarChart data={usersPerWeek} />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
              <p className="text-sm font-extrabold text-slate-800 dark:text-white mb-4">Recent Activity</p>
              <ActivityFeed items={activity} />
            </div>
          </div>

          {/* Writer requests */}
          <WriterRequestsTable initialWriters={writerRequests} />

          {/* Posts panel */}
          <div id="posts">
            <AdminPostsPanel />
          </div>

          {/* Users panel — fetches its own paginated data, no props needed */}
          <div id="users">
            <AdminUsersPanel currentUserId={auth.user.id} />
          </div>

        </main>
      </div>
    </div>
  );
}