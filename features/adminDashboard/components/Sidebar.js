"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "../utils/dashboardUtils";
import { IconClose } from "../icons/icons";

function getInitials(name) {
  if (!name) return "A";
  return name.trim().split(/\s+/).map((word) => word[0]).join("").slice(0, 2).toUpperCase();
}

function getActiveView(pathname) {
  const match = pathname.match(/^\/admin\/dashboard\/([^/]+)/);
  return match?.[1] || "overview";
}

function NavLinks({ activeView, onNavigate }) {
  return (
    <nav className="flex flex-col gap-1 p-2">
      {NAV.map(({ label, href, view, Icon }) => {
        const active = activeView === view;
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

function AdminProfileCard({ user }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/70 p-5 text-center shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-red-500 to-blue-700 text-2xl font-extrabold text-white ring-4 ring-white dark:ring-slate-900">
        {getInitials(user?.name)}
      </div>
      <p className="mt-3 font-extrabold tracking-tight text-slate-900 dark:text-white">{user?.name || "Admin"}</p>
      <p className="mt-0.5 break-all text-xs text-slate-500 dark:text-blue-100/50">{user?.email}</p>
      <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-700 dark:border-red-400/20 dark:bg-red-950/40 dark:text-red-300">
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
        System Admin
      </span>
    </div>
  );
}

export function Sidebar({ user }) {
  const pathname = usePathname();
  const activeView = getActiveView(pathname);
  return (
    <aside className="hidden w-72 shrink-0 py-6 pr-5 md:block">
      <div className="sticky top-24 grid gap-4">
        <AdminProfileCard user={user} />
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white/70 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
          <div className="border-b border-slate-100 px-4 py-2.5 dark:border-blue-400/10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-blue-100/30">Admin Dashboard</p>
          </div>
          <NavLinks activeView={activeView} />
        </div>
      </div>
    </aside>
  );
}

export function MobileNavDrawer({ open, onClose }) {
  const pathname = usePathname();
  const activeView = getActiveView(pathname);
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
        <NavLinks activeView={activeView} onNavigate={onClose} />
      </div>
    </div>
  );
}
