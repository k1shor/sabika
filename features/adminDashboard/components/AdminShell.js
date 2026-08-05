"use client";

import { Suspense } from "react";
import { useState } from "react";
import Link from "next/link";
import { Sidebar, MobileNavDrawer } from "./Sidebar";
import { IconMenu } from "../icons/icons";

export default function AdminShell({ user, children }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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

      <Suspense fallback={null}>
        <MobileNavDrawer open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      </Suspense>

      <div className="mx-auto flex max-w-7xl">
        <Suspense fallback={null}>
          <Sidebar user={user} />
        </Suspense>
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
