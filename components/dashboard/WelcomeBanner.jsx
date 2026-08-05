"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp } from "./dashboardUtils";

export default function WelcomeBanner({ user }) {
  const firstName = user?.name?.split(" ").slice(0, -1).join(" ") || user?.name;

  return (
    <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl shadow-sm">
      {/* Background: Gradient Blue — lighter in light mode, deeper/richer in dark mode */}
      <div className="absolute inset-0 bg-linear-to-br from-sky-400 via-blue-500 to-blue-600 dark:from-blue-700 dark:via-blue-800 dark:to-slate-900" />

      {/* SVG Decorative Blobs */}
      <svg className="absolute -right-12 -top-16 h-72 w-72" viewBox="0 0 200 200" aria-hidden="true">
        <path
          d="M45.3,-52.3C57.4,-42.6,64,-25.8,65.8,-8.5C67.6,8.9,64.6,26.9,54.7,40.6C44.8,54.3,27.9,63.7,9.4,67.2C-9.2,70.6,-29.3,68.1,-43.9,57.4C-58.4,46.7,-67.4,27.7,-69.1,8C-70.7,-11.7,-65,-32.1,-52.1,-42.4C-39.3,-52.6,-19.6,-52.7,-1.2,-51.2C17.3,-49.7,34.5,-46.6,45.3,-52.3Z"
          transform="translate(100 100)"
          fill="white"
          className="opacity-[0.08] dark:opacity-[0.05]"
        />
      </svg>
      <svg className="absolute -left-10 bottom-0 h-44 w-44" viewBox="0 0 200 200" aria-hidden="true">
        <circle cx="100" cy="100" r="90" fill="white" className="opacity-[0.06] dark:opacity-[0.04]" />
      </svg>

      {/* SVG dot-grid texture */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.1] dark:opacity-[0.07]" aria-hidden="true">
        <defs>
          <pattern id="dot-grid" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.4" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-grid)" />
      </svg>

      {/* Minimal Top Accent Border */}
      <div className="absolute left-0 right-0 top-0 h-1 bg-linear-to-r from-sky-300 via-white/70 to-sky-300 dark:from-blue-400 dark:via-white/40 dark:to-blue-400" />

      <div className="relative px-8 py-10">
        <h1 className="text-3xl font-extrabold text-white">
          Welcome, <span className="text-sky-100 dark:text-sky-200">{firstName}</span>
        </h1>
        <p className="mt-2 text-sm text-sky-50/90 dark:text-sky-100/70">
          Your nursing community in Nepal awaits. Discover articles, connect with professionals, and grow your knowledge.
        </p>

        <div className="mt-6 flex gap-3">
          {/* Front Button: white bg, RED text — slightly muted red bg in dark mode so it doesn't glare */}
          {/* Front Button: white bg, RED text, now with border + shadow so it doesn't blend into the gradient */}
          <Link
            href="/blogs"
            className="rounded-xl bg-white px-5 py-2 text-sm font-bold text-red-600! border border-red-100 shadow-md transition-all hover:bg-sky-50 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] dark:bg-slate-100 dark:border-red-200 dark:text-red-600! dark:hover:bg-white"
          >
            Browse Articles
          </Link>
          {/* Back Button: RED bg, white text — slightly deeper red in dark mode */}
          {user?.role === "admin" || (user?.role === "blog_writer" && user?.writerVerification?.status === "approved") ? (
            <Link href="/writers/posts" className="rounded-xl bg-red-600 px-5 py-2 text-sm font-bold text-white transition-all hover:bg-red-700 hover:scale-[1.02] active:scale-[0.98] dark:bg-red-700 dark:hover:bg-red-800">
              Write new post
            </Link>
          ) : (
            <Link href="/apply-writer" className="rounded-xl bg-red-600 px-5 py-2 text-sm font-bold text-white! transition-all hover:bg-red-700 hover:scale-[1.02] active:scale-[0.98] dark:bg-red-700 dark:hover:bg-red-800">
              Become a Contributor
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}