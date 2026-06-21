"use client";

import Link from "next/link";
import { motion } from "framer-motion";

function getInitials(name) {
  return String(name || "W")
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function WriterProfileClient({
  writer,
  posts,
  followerCount,
  isLoggedIn,
  isOwner,
  followButton,
}) {
  const initials = getInitials(writer.name);

  return (
    <div className="grid gap-6">
      {/* Header card */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/70 p-8 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25"
      >
        {/* Nepal flag accent strip */}
        <div className="absolute inset-x-0 top-0 h-1.5 bg-linear-to-r from-blue-600 via-blue-500 to-red-600" />

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            {isLoggedIn && writer.avatarUrl ? (
              <motion.img
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.35 }}
                src={writer.avatarUrl}
                alt={writer.name}
                className="h-16 w-16 rounded-full object-cover ring-4 ring-white dark:ring-slate-900"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-xl font-extrabold text-blue-700 dark:bg-blue-900/50 dark:text-blue-200">
                {isLoggedIn ? initials : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                )}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {writer.name}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {writer.username && (
                  <span className="text-sm font-semibold text-slate-500 dark:text-blue-100/50">
                    @{writer.username}
                  </span>
                )}
                <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:border-blue-400/20 dark:bg-blue-950/40 dark:text-blue-300">
                  Approved Writer
                </span>
                {isLoggedIn && writer.badge && (
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:border-amber-400/20 dark:bg-amber-950/30 dark:text-amber-300">
                    {writer.badge.replace(/_/g, " ")}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isOwner && (
              <Link
                href="/profile"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-blue-400/20 dark:bg-transparent dark:text-blue-200 dark:hover:bg-blue-950/30"
              >
                Edit profile
              </Link>
            )}
            {followButton}
          </div>
        </div>

        {/* Bio / locked notice */}
        {isLoggedIn ? (
          writer.bio && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="mt-5 text-sm leading-relaxed text-slate-600 dark:text-blue-100/70"
            >
              {writer.bio}
            </motion.p>
          )
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mt-5 flex flex-col items-start gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-5 dark:border-blue-400/20 dark:bg-blue-950/30 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-blue-100/70">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Log in to see bio, photo, and links for this writer.
            </div>
            <Link
              href={`/login?next=/writers/${writer._id}`}
              className="shrink-0 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Log in
            </Link>
          </motion.div>
        )}

        {/* Stats + social links — only when logged in */}
        {isLoggedIn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="mt-5 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4 dark:border-blue-400/10"
          >
            <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-blue-100/70">
              <span className="font-extrabold text-slate-900 dark:text-white">{posts.length}</span>
              {posts.length === 1 ? "Article" : "Articles"}
            </div>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-blue-100/70">
              <span className="font-extrabold text-slate-900 dark:text-white">{followerCount}</span>
              {followerCount === 1 ? "Follower" : "Followers"}
            </div>

            {writer.website && (
              <a
                href={writer.website}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                Website
              </a>
            )}
            {writer.twitter && (
              <a
                href={`https://twitter.com/${String(writer.twitter).replace(/^@/, "")}`}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                @{String(writer.twitter).replace(/^@/, "")}
              </a>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Posts — always visible, titles only when logged out */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-3xl border border-slate-200 bg-white/70 p-7 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25"
      >
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Writer Posts
        </h2>

        {posts.length === 0 ? (
          <div className="mt-5 text-sm font-semibold text-slate-600 dark:text-blue-100/70">
            No posts from this writer yet.
          </div>
        ) : (
          <div className="mt-5 grid gap-3">
            {posts.map((post, i) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 * i }}
              >
                <Link
                  href={`/blogs/${post.slug}`}
                  className="block rounded-2xl border border-slate-200 bg-white/80 p-4 transition hover:border-blue-300 hover:bg-white dark:border-blue-400/20 dark:bg-blue-950/30 dark:hover:bg-blue-950/45"
                >
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {post.title}
                  </div>
                  {isLoggedIn && post.excerpt ? (
                    <p className="mt-1 text-sm text-slate-600 dark:text-blue-100/70">
                      {post.excerpt}
                    </p>
                  ) : null}
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}