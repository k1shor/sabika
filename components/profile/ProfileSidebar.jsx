"use client";

import Link from "next/link";
import { getInitials, getRoleColor, getRoleLabel } from "./profileUtils";
function TabIcon({ tab, active }) {
  const cls = `shrink-0 ${active ? "opacity-90" : "opacity-50"}`;
  if (tab === "Dashboard") {
    return (
      <svg className={cls} xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    );
  }
  if (tab === "Profile") {
    return (
      <svg className={cls} xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    );
  }

  if (tab === "Bookmarks") {
    return (
      <svg className={cls} xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    );
  }

  if (tab === "Following") {
    return (
      <svg className={cls} xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }

  if (tab === "My Articles") {
    return (
      <svg className={cls} xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    );
  }

  if (tab === "Password") {
    return (
      <svg className={cls} xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    );
  }

  return null;
}

export default function ProfileSidebar({ user, activeTab, tabs, items, onTabChange, title = "Settings" }) {
  const navItems = items || tabs.map((tab) => ({ label: tab }));

  return (
    <aside className="w-full md:w-60 shrink-0 flex flex-col gap-4">
      <div className="rounded-3xl border border-slate-200 bg-white/70 p-5 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25 flex flex-col items-center text-center gap-3">
        <div className="relative">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt={user.name} className="h-20 w-20 rounded-full object-cover ring-4 ring-white dark:ring-slate-900" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-blue-100 to-blue-200 text-2xl font-extrabold text-blue-700 dark:from-blue-900/60 dark:to-blue-800/40 dark:text-blue-300 ring-4 ring-white dark:ring-slate-900">
              {getInitials(user.name)}
            </div>
          )}
          <button className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50 dark:border-blue-400/20 dark:bg-slate-800 dark:text-blue-300 dark:hover:bg-slate-700 transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>

        <div>
          <p className="font-extrabold tracking-tight text-slate-900 dark:text-white">{user.name || "User"}</p>
          {user.username && <p className="text-xs text-slate-400 dark:text-blue-100/40">@{user.username}</p>}
          <p className="mt-0.5 text-xs text-slate-500 dark:text-blue-100/50 break-all">{user.email}</p>
        </div>

        {user.badge && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:border-blue-400/20 dark:bg-blue-950/40 dark:text-blue-300">
            {user.badge.replace(/_/g, " ")}
          </span>
        )}

        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${getRoleColor(user.role)}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
          {getRoleLabel(user.role)}
        </span>

        {user.stats && (
          <div className="w-full grid grid-cols-3 gap-1 pt-2 border-t border-slate-100 dark:border-blue-400/10">
            {[
              { label: "Blogs", value: user.stats.totalBlogs },
              { label: "Followers", value: user.stats.totalFollowers },
              { label: "Following", value: user.stats.totalFollowing },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <span className="text-sm font-extrabold text-slate-800 dark:text-white">{stat.value}</span>
                <span className="text-[10px] text-slate-400 dark:text-blue-100/40">{stat.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-[#0B3C6B]/15 bg-white/70 shadow-sm dark:border-[#5B9BD5]/20 dark:bg-[#14161D] overflow-hidden">
        <div className="px-4 py-2.5 border-b border-[#0B3C6B]/10 dark:border-[#5B9BD5]/10">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#0B3C6B]/50 dark:text-[#5B9BD5]/40">{title}</p>
        </div>
        <nav className="p-2 flex flex-col gap-0.5">
          {navItems.map((item) => {
            const tab = item.label;
            const isActive = activeTab === (item.value || tab);
            const itemClass = `w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-left transition ${isActive
                ? "bg-[#0B3C6B] text-white! shadow-sm dark:bg-[#5B9BD5] dark:text-[#14151A]"
                : "text-[#0B3C6B]/70 hover:bg-[#0B3C6B]/5 dark:text-[#5B9BD5]/70 dark:hover:bg-[#5B9BD5]/10"
              }`;

            if (item.href) {
              return (
                <Link key={item.href} href={item.href} className={itemClass}>
                  <TabIcon tab={tab} active={isActive} />
                  {tab}
                </Link>
              );
            }

            return (
              <button key={tab} onClick={() => onTabChange(item.value || tab)} className={itemClass}>
                <TabIcon tab={tab} active={isActive} />
                {tab}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
