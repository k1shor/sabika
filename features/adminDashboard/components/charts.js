"use client";

import {
  ResponsiveContainer,
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";

// Shared tooltip styling for every chart on the dashboard.
export function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold shadow-lg dark:border-blue-400/20 dark:bg-slate-900">
      <p className="text-slate-400 dark:text-blue-100/40">{label}</p>
      <p className="mt-0.5 text-sm font-extrabold text-slate-900 dark:text-white">
        {payload[0].value} {payload[0].name || ""}
      </p>
    </div>
  );
}

export function ChartPanel({ title, total, totalLabel, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
      <div className="mb-2 flex items-baseline justify-between">
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

// Posts trend -- blue, the primary brand color.
export function PostsAreaChart({ data }) {
  if (!data?.length) {
    return <div className="flex h-40 items-center justify-center text-sm text-slate-400 dark:text-blue-100/30">No data yet</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="postsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-blue-400/10" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "currentColor" }} className="text-slate-400 dark:text-blue-100/40" axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "currentColor" }} className="text-slate-400 dark:text-blue-100/40" axisLine={false} tickLine={false} allowDecimals={false} width={24} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#2563eb", strokeOpacity: 0.15, strokeWidth: 24 }} />
        <Area type="monotone" dataKey="count" name="posts" stroke="#2563eb" strokeWidth={2.5} fill="url(#postsGradient)" dot={{ r: 3, fill: "#2563eb", strokeWidth: 0 }} activeDot={{ r: 5 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// New users trend -- red, the secondary brand color. Paired with the
// blue posts chart above, the two main trend charts read as one
// cohesive two-color brand instead of an arbitrary third hue.
export function UsersBarChart({ data }) {
  if (!data?.length) {
    return <div className="flex h-40 items-center justify-center text-sm text-slate-400 dark:text-blue-100/30">No data yet</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-blue-400/10" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "currentColor" }} className="text-slate-400 dark:text-blue-100/40" axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "currentColor" }} className="text-slate-400 dark:text-blue-100/40" axisLine={false} tickLine={false} allowDecimals={false} width={24} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "#dc2626", fillOpacity: 0.08 }} />
        <Bar dataKey="count" name="users" fill="#dc2626" radius={[6, 6, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Post status is a genuine status/state breakdown, so it keeps
// standard semantic colors (green=approved, amber=pending, red=rejected,
// gray=draft) -- that's meaningful color-coding, not brand chrome.
const STATUS_COLORS = {
  approved: "#10b981",
  pending:  "#f59e0b",
  rejected: "#dc2626",
  draft:    "#94a3b8",
};
const STATUS_LABELS = {
  approved: "Approved",
  pending:  "Pending",
  rejected: "Rejected",
  draft:    "Draft",
};

export function PostStatusDonut({ counts }) {
  const total = Object.values(counts || {}).reduce((sum, n) => sum + n, 0);
  const data = Object.entries(counts || {})
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({ key, name: STATUS_LABELS[key], value }));

  if (total === 0) {
    return <div className="flex h-40 items-center justify-center text-sm text-slate-400 dark:text-blue-100/30">No posts yet</div>;
  }

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={45}
            outerRadius={68}
            paddingAngle={2}
            strokeWidth={0}
          >
            {data.map((entry) => (
              <Cell key={entry.key} fill={STATUS_COLORS[entry.key]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{total}</span>
        <span className="text-[10px] font-semibold text-slate-400 dark:text-blue-100/40">total posts</span>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1">
        {data.map((entry) => (
          <span key={entry.key} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-blue-100/60">
            <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLORS[entry.key] }} />
            {entry.name} ({entry.value})
          </span>
        ))}
      </div>
    </div>
  );
}