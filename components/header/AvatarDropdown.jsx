"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronIcon, LogoutIcon, UserIcon } from "./HeaderIcons";
import { getInitials, getRoleLabel } from "./headerUtils";

export default function AvatarDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(event) {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const menuItems = [
    { href: user?.role === "admin" ? "/admin/dashboard/profile" : "/dashboard/profile", icon: UserIcon, label: "My Profile" },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((state) => !state)}
        className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 pl-1.5 pr-3 py-1.5 shadow-sm transition hover:border-blue-200 hover:shadow-md dark:border-blue-400/20 dark:bg-blue-950/50 dark:hover:bg-blue-950/70"
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-blue-700 text-[11px] font-extrabold text-white">
          {getInitials(user.name)}
        </div>
        <div className="hidden lg:flex flex-col leading-tight text-left">
          <span className="text-[12px] font-bold text-slate-800 dark:text-white max-w-24 truncate">{user.name || "User"}</span>
          <span className="text-[10px] font-semibold text-slate-400 dark:text-blue-300/60">{getRoleLabel(user.role)}</span>
        </div>
        <ChevronIcon className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/60 z-50 dark:border-blue-400/20 dark:bg-slate-900 dark:shadow-none overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-blue-400/10 bg-linear-to-r from-blue-50/60 to-white dark:from-blue-950/30 dark:to-transparent">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-blue-700 text-sm font-extrabold text-white">
              {getInitials(user.name)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-400 dark:text-blue-300/60 truncate">{user.email}</p>
            </div>
          </div>

          <div className="py-1.5">
            {menuItems.map(({ href, icon: Icon, label }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition dark:text-blue-100/80 dark:hover:bg-blue-950/40">
                <Icon />{label}
              </Link>
            ))}
          </div>

          <div className="border-t border-slate-100 dark:border-blue-400/10 py-1.5">
            <button onClick={() => { setOpen(false); onLogout(); }} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition dark:text-red-400 dark:hover:bg-red-950/30">
              <LogoutIcon />Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
