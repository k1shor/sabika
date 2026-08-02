"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getDesktopNavItems } from "./headerData";

export function DesktopNavLink({ href, label }) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`relative flex flex-col items-center gap-0.5 text-sm font-semibold transition-colors duration-150 ${
        isActive
          ? "text-blue-700 dark:text-blue-400"
          : "text-slate-600 hover:text-blue-600 dark:text-blue-100/75 dark:hover:text-blue-300"
      }`}
    >
      {label}
      <span className={`h-[2.5px] w-full rounded-full bg-linear-to-r from-blue-600 to-red-500 transition-opacity duration-150 ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-40"}`} />
    </Link>
  );
}

export function DesktopNav({ isAdmin, canApplyAsWriter, canWritePosts }) {
  const allItems = getDesktopNavItems({ isAdmin, canApplyAsWriter, canWritePosts });

  return (
    <nav className="hidden md:flex items-center gap-6">
      {allItems.map((item) => (
        <DesktopNavLink key={item.href} href={item.href} label={item.label} />
      ))}
    </nav>
  );
}

export function MobileNavLink({ href, label, onClick }) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
        isActive
          ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
          : "text-slate-600 hover:bg-slate-50 hover:text-blue-600 dark:text-blue-100/75 dark:hover:bg-blue-950/40 dark:hover:text-blue-300"
      }`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${isActive ? "bg-linear-to-br from-blue-600 to-red-500" : "bg-transparent"}`} />
      {label}
      {isActive && <span className="ml-auto text-[10px] font-bold text-blue-400 dark:text-blue-500">●</span>}
    </Link>
  );
}
