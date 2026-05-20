"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Container from "@/components/Container";
import { DUMMY_POSTS } from "@/lib/dummy";

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

function getSavedArticles() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("saved-articles") || "[]");
  } catch { return []; }
}

function getRecentlyViewed() {
  if (typeof window === "undefined") return [];
  try {
    const items = JSON.parse(localStorage.getItem("recently-viewed") || "[]");
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return items.filter((i) => i.timestamp > cutoff).slice(0, 3);
  } catch { return []; }
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ─── Daily inspiration quotes ─────────────────────────────────────────────────

const QUOTES = [
  "Nursing is not just a profession. It's a way of making a difference.",
  "The trained nurse has become one of the great blessings of humanity.",
  "Nurses dispense comfort, compassion, and caring without even a prescription.",
  "To do what nobody else will do, in a way that nobody else can — that's what nursing is.",
  "Caring is the essence of nursing.",
];

function getDailyQuote() {
  const day = Math.floor(Date.now() / 86400000);
  return QUOTES[day % QUOTES.length];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function WelcomeBanner({ user }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-linear-to-r from-blue-600 via-blue-700 to-blue-800 p-7 shadow-sm dark:border-blue-400/20">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute right-8 top-1/2 -translate-y-1/2 text-[120px] select-none">🏥</div>
      </div>
      <div className="absolute bottom-0 right-0 h-32 w-64 rounded-full bg-white/5 translate-x-16 translate-y-8" />
      <div className="absolute top-0 right-32 h-20 w-20 rounded-full bg-white/5 -translate-y-6" />

      <div className="relative">
        <p className="text-blue-200 text-sm font-semibold">{getGreeting()}</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white">
          Welcome back, {getFirstName(user?.name)}! 👋
        </h1>
        <p className="mt-2 text-blue-100/80 text-sm max-w-md">
          Stay informed. Stay inspired. Make a difference. Here's what's happening in your nursing community today.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-blue-700 shadow-sm hover:bg-blue-50 transition"
          >
            Browse Articles
          </Link>
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/20 transition"
          >
            My Profile
          </Link>
        </div>
      </div>
    </div>
  );
}

function ArticleCard({ post }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedList = getSavedArticles();
    setSaved(savedList.some((s) => s.slug === post.slug));
  }, [post.slug]);

  const toggleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const savedList = getSavedArticles();
    if (saved) {
      const next = savedList.filter((s) => s.slug !== post.slug);
      localStorage.setItem("saved-articles", JSON.stringify(next));
      setSaved(false);
    } else {
      savedList.push({ slug: post.slug, title: post.title, coverImage: post.coverImage });
      localStorage.setItem("saved-articles", JSON.stringify(savedList));
      setSaved(true);
    }
  };

  const tags = Array.isArray(post.tags) ? post.tags : [];
  const published = post.publishedAt || post.createdAt;

  return (
    <Link
      href={`/blogs/${encodeURIComponent(post.slug)}`}
      className="group flex gap-4 rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm transition hover:shadow-md hover:border-blue-200
      dark:border-blue-400/20 dark:bg-blue-950/20 dark:hover:border-blue-400/40"
    >
      {post.coverImage && (
        <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.coverImage} alt={post.title} className="h-full w-full object-cover group-hover:scale-105 transition duration-300" />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        {tags[0] && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">{tags[0]}</span>
            {post.readTime && <span className="text-[11px] text-slate-400">· {post.readTime}</span>}
          </div>
        )}
        <p className="text-sm font-extrabold leading-snug text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition">
          {post.title}
        </p>
        {post.excerpt && (
          <p className="text-xs text-slate-500 dark:text-blue-100/50 line-clamp-2 leading-relaxed">{post.excerpt}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-400 dark:text-blue-100/40">{formatDate(published)}</span>
          <button
            onClick={toggleSave}
            className={`rounded-lg p-1.5 transition ${saved ? "text-blue-600 dark:text-blue-400" : "text-slate-300 hover:text-blue-500 dark:text-blue-100/20 dark:hover:text-blue-400"}`}
            title={saved ? "Remove bookmark" : "Save article"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </Link>
  );
}

function ReadingHubCard({ savedCount, recentlyViewed }) {
  return (
    <div className="flex flex-col gap-4">

      {/* Saved count */}
      <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-4xl font-extrabold text-slate-900 dark:text-white">{savedCount}</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-500 dark:text-blue-100/60">Saved Articles</p>
          </div>
          <Link
            href="/saved"
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-950/60"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </Link>
        </div>
      </div>

      {/* Continue reading */}
      {recentlyViewed.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
          <div className="flex items-center gap-2 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <p className="text-sm font-extrabold text-slate-800 dark:text-white">Continue Reading</p>
          </div>
          <div className="flex flex-col gap-3">
            {recentlyViewed.map((item, i) => (
              <Link
                key={item.slug}
                href={`/blogs/${encodeURIComponent(item.slug)}`}
                className="flex items-center gap-3 group"
              >
                {item.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.coverImage} alt={item.title} className="h-10 w-14 shrink-0 rounded-lg object-cover" />
                ) : (
                  <div className="h-10 w-14 shrink-0 rounded-lg bg-blue-100 dark:bg-blue-900/40" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                    {item.title}
                  </p>
                  <div className="mt-1 h-1 w-full rounded-full bg-slate-100 dark:bg-blue-950/40 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: `${[60, 35, 20][i] || 10}%` }}
                    />
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-400 dark:text-blue-100/40 shrink-0">
                  {[60, 35, 20][i] || 10}%
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Daily inspiration */}
      <div className="rounded-2xl border border-yellow-200 bg-yellow-50/60 p-5 dark:border-yellow-400/20 dark:bg-yellow-950/20">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">💡</span>
          <p className="text-sm font-extrabold text-yellow-800 dark:text-yellow-300">Daily Inspiration</p>
        </div>
        <p className="text-sm text-yellow-700/80 dark:text-yellow-300/70 leading-relaxed italic">
          "{getDailyQuote()}"
        </p>
      </div>

    </div>
  );
}

// ─── Quick stats for blog writer / admin ──────────────────────────────────────

function QuickStats({ role }) {
  if (role === "visitor") return null;

  const stats = role === "admin"
    ? [
        { label: "Total Users",    value: "—", color: "text-blue-600 dark:text-blue-400"  },
        { label: "Total Articles", value: "—", color: "text-green-600 dark:text-green-400" },
        { label: "Pending Review", value: "—", color: "text-yellow-600 dark:text-yellow-400" },
      ]
    : [
        { label: "Published",  value: "—", color: "text-green-600 dark:text-green-400"  },
        { label: "Pending",    value: "—", color: "text-yellow-600 dark:text-yellow-400" },
        { label: "Drafts",     value: "—", color: "text-slate-500 dark:text-slate-400"  },
      ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25 text-center">
          <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
          <div className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-blue-100/60">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [user,          setUser]          = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [savedCount,    setSavedCount]    = useState(0);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { if (d?.ok && d?.user) setUser(d.user); })
      .catch(() => null)
      .finally(() => setLoading(false));

    setSavedCount(getSavedArticles().length);
    setRecentlyViewed(getRecentlyViewed());
  }, []);

  if (loading) {
    return (
      <Container>
        <div className="flex items-center justify-center py-24 text-sm text-slate-500 dark:text-blue-100/50">
          Loading...
        </div>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container>
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <p className="text-sm text-slate-500 dark:text-blue-100/50">
            You must be logged in to view your dashboard.
          </p>
          <Link
            href="/login"
            className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-blue-700 transition"
          >
            Login
          </Link>
        </div>
      </Container>
    );
  }

  // Use dummy posts for latest articles (replace with API fetch when ready)
  const latestPosts = (Array.isArray(DUMMY_POSTS) ? DUMMY_POSTS : []).slice(0, 5);

  return (
    <Container>
      <div className="grid gap-6">

        {/* Welcome banner */}
        <WelcomeBanner user={user} />

        {/* Quick stats (writer/admin only) */}
        <QuickStats role={user.role} />

        {/* Main grid: articles + reading hub */}
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">

          {/* Latest articles */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                Latest Articles
              </h2>
              <Link
                href="/blogs"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition flex items-center gap-1"
              >
                View all
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {latestPosts.map((post) => (
                <ArticleCard key={post.slug} post={post} />
              ))}
            </div>
          </div>

          {/* Reading hub sidebar */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
              My Reading Hub
            </h2>
            <ReadingHubCard savedCount={savedCount} recentlyViewed={recentlyViewed} />
          </div>

        </div>
      </div>
    </Container>
  );
}