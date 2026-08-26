"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "My Profile", href: "/profile" },
  { label: "Bookmarks", href: "/saved" },
  { label: "Following", href: "/following" },
];

export default function ProfileNavTabs() {
  const pathname = usePathname();

  return (
    <div className="mb-6 flex gap-1.5">
      {TABS.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`group relative -skew-x-12 px-6 py-2 text-sm font-bold transition-colors ${
              isActive
                ? "bg-blue-600 shadow-md shadow-blue-600/20"
                : "bg-slate-100 hover:bg-slate-200 dark:bg-blue-950/30 dark:hover:bg-blue-950/50"
            }`}
          >
            <span
              className={`inline-block skew-x-12 ${
                isActive
                  ? "text-white"
                  : "text-slate-600 dark:text-blue-100/70"
              }`}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}