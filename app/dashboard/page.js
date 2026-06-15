"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Container from "@/components/Container";
import { motion, AnimatePresence } from "framer-motion";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function getFirstName(name) {
  if (!name) return "there";
  return name.trim().split(" ")[0];
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getRecentlyViewed() {
  if (typeof window === "undefined") return [];
  try {
    const items = JSON.parse(localStorage.getItem("recently-viewed") || "[]");
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return items.filter((i) => i.timestamp > cutoff).slice(0, 3);
  } catch { return []; }
}

const QUOTES = [
  "Nursing is not just a profession. It is a way of making a difference.",
  "The trained nurse has become one of the great blessings of humanity.",
  "Nurses dispense comfort, compassion, and caring without even a prescription.",
  "To do what nobody else will do, in a way that nobody else can: that is what nursing is.",
  "Caring is the essence of nursing.",
];

function getDailyQuote() {
  const day = Math.floor(Date.now() / 86400000);
  return QUOTES[day % QUOTES.length];
}

// ─── Animation variants ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

// Nepal flag crimson + deep blue palette
// Crimson: #DC143C  Deep Blue: #003893

// ─── Welcome Banner ───────────────────────────────────────────────────────────

function WelcomeBanner({ user }) {
  return (
    <motion.div
      variants={fadeUp}
      className="relative overflow-hidden rounded-3xl shadow-md"
    >
      {/* 🌿 Mint Background */}
      <div className="absolute inset-0 bg-linear-to-br from-[#ECFDF5] via-[#D1FAE5] to-[#F0FDF4]" />

      {/* Soft Nepal accents */}
      <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#E35D6A]/10 blur-3xl" />
      <div className="absolute -left-10 bottom-0 h-40 w-60 rounded-full bg-[#4A6FA5]/10 blur-2xl" />

      {/* Top bar */}
      <div className="absolute left-0 right-0 top-0 h-1 bg-linear-to-r from-[#4A6FA5] via-[#E35D6A] to-[#4A6FA5]" />

      <div className="relative px-8 py-10">
        <h1 className="text-3xl font-extrabold text-slate-800">
          Welcome,{" "}
          <span className="text-[#E35D6A]">
            {user?.name?.split(" ")[0]}
          </span>
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Your nursing community in Nepal awaits.
        </p>

        <div className="mt-6 flex gap-3">
          <Link
            href="/blogs"
            className="rounded-xl bg-[#E35D6A] px-5 py-2 text-sm font-bold text-white hover:bg-[#d14c59]"
          >
            Browse Articles
          </Link>

          <Link
            href="/profile"
            className="rounded-xl border border-slate-300 px-5 py-2 text-sm font-bold text-slate-700 hover:bg-white/60"
          >
            My Profile
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Quick Stats ──────────────────────────────────────────────────────────────

function QuickStats({ role, posts }) {
  if (role === "visitor") return null;

  const stats = role === "blog_writer" ? [
    { label: "Published", value: posts.filter((p) => p.status === "approved").length, icon: "✓", color: "border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-950/20", text: "text-emerald-700 dark:text-emerald-400" },
    { label: "Pending", value: posts.filter((p) => p.status === "pending").length, icon: "⏳", color: "border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-950/20", text: "text-amber-700 dark:text-amber-400" },
    { label: "Drafts", value: posts.filter((p) => p.status === "draft").length, icon: "✎", color: "border-slate-200 bg-slate-50 dark:border-slate-500/20 dark:bg-slate-900/20", text: "text-slate-600 dark:text-slate-400" },
  ] : [
    { label: "Total Blogs", value: "—", icon: "📝", color: "border-red-200 bg-red-50/60 dark:border-red-500/20 dark:bg-red-950/20", text: "text-[#DC143C] dark:text-red-400" },
    { label: "Total Users", value: "—", icon: "👥", color: "border-blue-200 bg-blue-50/60 dark:border-blue-500/20 dark:bg-blue-950/20", text: "text-[#003893] dark:text-blue-400" },
    { label: "Pending Review", value: "—", icon: "🔍", color: "border-amber-200 bg-amber-50/60 dark:border-amber-500/20 dark:bg-amber-950/20", text: "text-amber-700 dark:text-amber-400" },
  ];

  return (
    <motion.div variants={stagger} className="grid grid-cols-3 gap-3">
      {stats.map((s) => (
        <motion.div
          key={s.label}
          variants={fadeUp}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className={`rounded-2xl border ${s.color} p-4 shadow-sm`}
        >
          <div className="text-xl mb-1">{s.icon}</div>
          <div className={`text-3xl font-extrabold ${s.text}`}>{s.value}</div>
          <div className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">{s.label}</div>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ─── Article Card ─────────────────────────────────────────────────────────────

function ArticleCard({ post, index }) {
  const tags = Array.isArray(post.tags) ? post.tags : [];

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ x: 4, transition: { duration: 0.2 } }}
    >
      <Link
        href={`/blogs/${encodeURIComponent(post.slug)}`}
        className="group flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[#DC143C]/30 hover:shadow-md dark:border-slate-700/50 dark:bg-slate-900/50 dark:hover:border-red-500/30"
      >
        {post.coverImage ? (
          <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
            />
          </div>
        ) : (
          <div className="h-20 w-28 shrink-0 rounded-xl bg-linear-to-br from-[#DC143C]/10 to-[#003893]/10 flex items-center justify-center">
            <span className="text-2xl opacity-40">📄</span>
          </div>
        )}

        <div className="flex flex-1 flex-col gap-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            {post.category && (
              <span className="rounded-full bg-[#DC143C]/8 px-2 py-0.5 text-[10px] font-bold text-[#DC143C] dark:bg-red-950/30 dark:text-red-400">
                {post.category.replace(/_/g, " ")}
              </span>
            )}
            {post.postType && post.postType !== "normal" && (
              <span className="rounded-full bg-[#003893]/8 px-2 py-0.5 text-[10px] font-bold text-[#003893] dark:bg-blue-950/30 dark:text-blue-400">
                {post.postType.replace(/_/g, " ")}
              </span>
            )}
            {post.readTime && (
              <span className="ml-auto text-[10px] text-slate-400">{post.readTime}</span>
            )}
          </div>

          <p className="text-sm font-extrabold leading-snug text-slate-900 line-clamp-2 transition group-hover:text-[#DC143C] dark:text-white dark:group-hover:text-red-400">
            {post.title}
          </p>

          {post.excerpt && (
            <p className="text-xs leading-relaxed text-slate-500 line-clamp-1 dark:text-slate-400">
              {post.excerpt}
            </p>
          )}

          <div className="mt-auto flex items-center gap-2 pt-0.5">
            <div className="h-4 w-4 rounded-full bg-linear-to-br from-[#DC143C]/30 to-[#003893]/30 flex items-center justify-center">
              <span className="text-[8px] font-bold text-slate-600 dark:text-slate-300">
                {post.isAnonymous ? "?" : (post.authorId?.name?.[0] || "N")}
              </span>
            </div>
            <span className="text-[10px] font-semibold text-slate-400">
              {post.isAnonymous ? "Anonymous" : (post.authorId?.name || "Nursing Nepal")}
            </span>
            <span className="text-slate-200 dark:text-slate-700">·</span>
            <span className="text-[10px] text-slate-400">{formatDate(post.publishedAt || post.createdAt)}</span>
            <div className="ml-auto flex items-center gap-1 text-[10px] text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
              {post.views || 0}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ user, savedCount, recentlyViewed }) {
  return (
    <motion.div variants={stagger} className="flex flex-col gap-4">

      {/* Profile card */}
      <motion.div
        variants={fadeUp}
        className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700/50 dark:bg-slate-900/50"
      >
        {/* Top accent */}
        <div className="absolute left-0 right-0 top-0 h-0.5 bg-linear-to-r from-[#DC143C] to-[#003893]" />

        <div className="flex items-center gap-3">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-[#DC143C]/20"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-[#DC143C] to-[#003893] text-sm font-extrabold text-white shadow-md">
              {user?.name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?"}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-extrabold text-slate-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
            {user?.badge && (
              <span className="mt-1 inline-block rounded-full bg-[#DC143C]/8 px-2 py-0.5 text-[10px] font-bold text-[#DC143C] dark:bg-red-950/30 dark:text-red-400">
                {user.badge.replace(/_/g, " ")}
              </span>
            )}
          </div>
        </div>

        <Link
          href="/profile"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600 transition hover:border-[#DC143C]/30 hover:bg-[#DC143C]/5 hover:text-[#DC143C] dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300"
        >
          Edit Profile →
        </Link>
      </motion.div>

      {/* Saved articles */}
      <motion.div variants={fadeUp}>
        <Link
          href="/saved"
          className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#DC143C]/30 hover:shadow-md dark:border-slate-700/50 dark:bg-slate-900/50"
        >
          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{savedCount}</div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Saved Articles</div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DC143C]/8 text-[#DC143C] transition group-hover:bg-[#DC143C]/15 dark:bg-red-950/30 dark:text-red-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
          </div>
        </Link>
      </motion.div>

      {/* Continue reading */}
      {recentlyViewed.length > 0 && (
        <motion.div
          variants={fadeUp}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700/50 dark:bg-slate-900/50"
        >
          <p className="mb-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Continue Reading</p>
          <div className="flex flex-col gap-3">
            {recentlyViewed.map((item, i) => (
              <Link key={item.slug} href={`/blogs/${encodeURIComponent(item.slug)}`} className="group flex items-center gap-3">
                {item.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.coverImage} alt={item.title} className="h-10 w-14 shrink-0 rounded-lg object-cover" />
                ) : (
                  <div className="h-10 w-14 shrink-0 rounded-lg bg-linear-to-br from-[#DC143C]/10 to-[#003893]/10" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 line-clamp-2 transition group-hover:text-[#DC143C] dark:text-slate-200">
                    {item.title}
                  </p>
                  <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${[65, 35, 15][i] || 10}%` }}
                      transition={{ delay: 0.6 + i * 0.1, duration: 0.7, ease: "easeOut" }}
                      className="h-full rounded-full bg-linear-to-r from-[#DC143C] to-[#003893]"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Daily quote */}
      <motion.div
        variants={fadeUp}
        className="relative overflow-hidden rounded-2xl border border-[#DC143C]/20 bg-linear-to-br from-[#DC143C]/5 to-[#003893]/5 p-5"
      >
        <div className="absolute right-3 top-3 text-4xl opacity-10">❝</div>
        <p className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-[#DC143C]/70">Daily Inspiration</p>
        <p className="text-sm italic leading-relaxed text-slate-700 dark:text-slate-300">
          &quot;{getDailyQuote()}&quot;
        </p>
      </motion.div>

      {/* Quick links */}
      <motion.div
        variants={fadeUp}
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700/50 dark:bg-slate-900/50"
      >
        <p className="mb-2 px-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Navigate</p>
        {[
          { href: "/following", label: "Writers I Follow", icon: "👥" },
          { href: "/notifications", label: "Notifications", icon: "🔔" },
          { href: "/saved", label: "Saved Posts", icon: "🔖" },
          { href: "/writers", label: "Find Writers", icon: "✍️" },
          ...(user?.writerVerification?.status === "none" || !user?.writerVerification
            ? [{ href: "/apply-writer", label: "Become a Writer", icon: "📝" }]
            : []),
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-[#DC143C]/5 hover:text-[#DC143C] dark:text-slate-400 dark:hover:bg-red-950/20 dark:hover:text-red-400"
          >
            <span className="text-base">{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </motion.div>

    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [savedCount, setSavedCount] = useState(0);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    // user
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok && d?.user) {
          setUser(d.user);
          if (d.user.role === "blog_writer") {
            fetch("/api/blogs?mine=true")
              .then((r) => r.json())
              .then((d) => { if (d?.ok) setMyPosts(d.posts || []); })
              .catch(() => null);
          }
        }
      })
      .catch(() => null)
      .finally(() => setLoading(false));

    // latest posts
    fetch("/api/blogs?limit=6&status=approved")
      .then((r) => r.json())
      .then((d) => { if (d?.ok) setPosts(d.posts || []); })
      .catch(() => null)
      .finally(() => setPostsLoading(false));

    // saved count
    fetch("/api/auth/me/saved-posts")
      .then((r) => r.json())
      .then((d) => { if (d?.ok) setSavedCount(d.posts?.length || 0); })
      .catch(() => null);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecentlyViewed(getRecentlyViewed());
  }, []);

  if (loading) {
    return (
      <Container>
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-8 w-8 rounded-full border-2 border-red-200 border-t-[#DC143C]"
          />
          <p className="text-xs font-semibold text-slate-400">Loading your dashboard...</p>
        </div>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-32 gap-5 text-center"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-[#DC143C]/10 to-[#003893]/10 text-4xl">
            🏥
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">You are not logged in</p>
            <p className="mt-1 text-sm text-slate-500">Login to access your nursing dashboard.</p>
          </div>
          <Link
            href="/login"
            className="rounded-xl bg-[#DC143C] px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-red-900/20 transition hover:bg-[#c01232] hover:shadow-lg"
          >
            Login to continue
          </Link>
        </motion.div>
      </Container>
    );
  }

  return (
    <Container>
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid gap-6"
      >
        {/* Banner */}
        <WelcomeBanner user={user} />

        {/* Quick stats */}
        <QuickStats role={user.role} posts={myPosts} />

        {/* Main grid */}
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">

          {/* Articles */}
          <div className="flex flex-col gap-4">
            <motion.div variants={fadeUp} className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                Latest Articles
              </h2>
              <Link
                href="/blogs"
                className="flex items-center gap-1 text-sm font-bold text-[#DC143C] transition hover:text-[#c01232] dark:text-red-400"
              >
                View all
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
              </Link>
            </motion.div>

            {postsLoading ? (
              <div className="flex flex-col gap-3">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                    className="h-28 rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800/50"
                  />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <motion.div
                variants={fadeUp}
                className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center dark:border-slate-700 dark:bg-slate-900/30"
              >
                <div className="text-3xl mb-2">📭</div>
                <p className="text-sm font-semibold text-slate-500">No articles published yet.</p>
                {user.role === "blog_writer" && user.writerVerification?.status === "approved" && (
                  <Link href="/writers/posts" className="mt-3 inline-block text-sm font-bold text-[#DC143C] hover:underline">
                    Be the first to write one →
                  </Link>
                )}

                {user.role === "blog_writer" && user.writerVerification?.status === "pending" && (
                  <p className="mt-3 text-sm font-semibold text-amber-600 dark:text-amber-400">
                    ⏳ Your writer application is under review.
                  </p>
                )}
              </motion.div>
            ) : (
              <motion.div variants={stagger} className="flex flex-col gap-3">
                {posts.map((post, i) => (
                  <ArticleCard key={post._id || post.slug} post={post} index={i} />
                ))}
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <Sidebar user={user} savedCount={savedCount} recentlyViewed={recentlyViewed} />
        </div>
      </motion.div>
    </Container>
  );
}
