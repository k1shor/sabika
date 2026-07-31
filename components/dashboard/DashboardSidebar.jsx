"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp, getDailyQuote, stagger } from "./dashboardUtils";

function initials(name) {
  return name?.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase() || "?";
}

export default function DashboardSidebar({ user, savedCount, recentlyViewed }) {
  const links = [
    { href: "/following", label: "Writers I Follow" },
    { href: "/notifications", label: "Notifications" },
    { href: "/saved", label: "Saved Posts" },
    ...(user?.role !== "admin" && (user?.writerVerification?.status === "none" || !user?.writerVerification)
      ? [{ href: "/apply-writer", label: "Become a Writer" }]
      : []),
  ];

  return (
    <motion.div variants={stagger} className="flex flex-col gap-4">
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700/50 dark:bg-slate-900/50">
        <div className="absolute left-0 right-0 top-0 h-0.5 bg-linear-to-r from-[#DC143C] to-[#003893]" />
        <div className="flex items-center gap-3">
          {user?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt={user.name} className="h-12 w-12 rounded-full object-cover ring-2 ring-[#DC143C]/20" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-[#DC143C] to-[#003893] text-sm font-extrabold text-white shadow-md">
              {initials(user?.name)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-extrabold text-slate-900 dark:text-white">{user?.name}</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
          </div>
        </div>
        <Link href="/profile" className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600 transition hover:border-[#DC143C]/30 hover:bg-[#DC143C]/5 hover:text-[#DC143C] dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
          Edit Profile
        </Link>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Link href="/saved" className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#DC143C]/30 hover:shadow-md dark:border-slate-700/50 dark:bg-slate-900/50">
          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{savedCount}</div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Saved Articles</div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DC143C]/8 text-xs font-extrabold text-[#DC143C]">SAVE</div>
        </Link>
      </motion.div>

      {recentlyViewed.length > 0 && (
        <motion.div variants={fadeUp} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700/50 dark:bg-slate-900/50">
          <p className="mb-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Continue Reading</p>
          <div className="flex flex-col gap-3">
            {recentlyViewed.map((item) => (
              <Link key={item.slug} href={`/blogs/${encodeURIComponent(item.slug)}`} className="group flex items-center gap-3">
                {item.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.coverImage} alt={item.title} className="h-10 w-14 shrink-0 rounded-lg object-cover" />
                ) : (
                  <div className="h-10 w-14 shrink-0 rounded-lg bg-linear-to-br from-[#DC143C]/10 to-[#003893]/10" />
                )}
                <p className="line-clamp-2 text-xs font-semibold text-slate-800 transition group-hover:text-[#DC143C] dark:text-slate-200">
                  {item.title}
                </p>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl border border-[#DC143C]/20 bg-linear-to-br from-[#DC143C]/5 to-[#003893]/5 p-5">
        <p className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-[#DC143C]/70">Daily Inspiration</p>
        <p className="text-sm italic leading-relaxed text-slate-700 dark:text-slate-300">&quot;{getDailyQuote()}&quot;</p>
      </motion.div>

      <motion.div variants={fadeUp} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700/50 dark:bg-slate-900/50">
        <p className="mb-2 px-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Navigate</p>
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-[#DC143C]/5 hover:text-[#DC143C] dark:text-slate-400 dark:hover:bg-red-950/20 dark:hover:text-red-400">
            {link.label}
          </Link>
        ))}
      </motion.div>
    </motion.div>
  );
}
