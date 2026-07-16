"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp, formatDate } from "./dashboardUtils";

export default function DashboardArticleCard({ post }) {
  const authorName = post.isOfficialPost
    ? "Nursing Nepal"
    : post.isAnonymous
      ? "Anonymous"
      : post.authorId?.name || "Unknown";

  return (
    <motion.div variants={fadeUp} whileHover={{ x: 4 }}>
      <Link
        href={`/blogs/${encodeURIComponent(post.slug)}`}
        className="group flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[#DC143C]/30 hover:shadow-md dark:border-slate-700/50 dark:bg-slate-900/50"
      >
        {post.coverImage ? (
          <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.coverImage} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
          </div>
        ) : (
          <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-[#DC143C]/10 to-[#003893]/10">
            <span className="text-xs font-extrabold text-slate-400">POST</span>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {post.category && (
              <span className="rounded-full bg-[#DC143C]/8 px-2 py-0.5 text-[10px] font-bold text-[#DC143C] dark:bg-red-950/30 dark:text-red-400">
                {post.category.replace(/_/g, " ")}
              </span>
            )}
            {post.readTime && <span className="ml-auto text-[10px] text-slate-400">{post.readTime}</span>}
          </div>

          <p className="line-clamp-2 text-sm font-extrabold leading-snug text-slate-900 transition group-hover:text-[#DC143C] dark:text-white dark:group-hover:text-red-400">
            {post.title}
          </p>
          {post.excerpt && <p className="line-clamp-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{post.excerpt}</p>}
          <div className="mt-auto flex items-center gap-2 pt-0.5">
            <span className="text-[10px] font-semibold text-slate-400">
              {authorName}
            </span>
            <span className="text-slate-200 dark:text-slate-700">.</span>
            <span className="text-[10px] text-slate-400">{formatDate(post.publishedAt || post.createdAt)}</span>
            <span className="ml-auto text-[10px] text-slate-400">{post.views || 0} views</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}