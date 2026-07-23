"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "../utils/dashboardUtils";
import { IconClose } from "../icons/icons";

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

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white/70 py-6 dark:border-blue-400/20 dark:bg-blue-950/20 md:block">
      <NavLinks pathname={pathname} />
    </aside>
  );
}

export function MobileNavDrawer({ open, onClose }) {
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