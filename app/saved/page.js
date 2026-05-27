"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Container from "@/components/Container";

export default function SavedPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/auth/me/saved-posts", { cache: "no-store" });
    const data = await res.json().catch(() => null);

    setLoading(false);

    if (!data?.ok) {
      setMessage(data?.error || "Login required to view saved posts.");
      setPosts([]);
      return;
    }

    setPosts(Array.isArray(data.posts) ? data.posts : []);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  return (
    <Container>
      <div className="rounded-3xl border border-slate-200 bg-white/70 p-7 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Saved Blogs
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-blue-100/70">
              Blogs you bookmarked from article pages.
            </p>
          </div>

          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="mt-6 text-sm font-semibold text-slate-500 dark:text-blue-100/60">
            Loading saved blogs...
          </div>
        ) : message ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100">
            {message}
          </div>
        ) : posts.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-600 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100/70">
            No saved blogs yet.
          </div>
        ) : (
          <div className="mt-6 grid gap-3">
            {posts.map((post) => (
              <Link
                key={post._id || post.slug}
                href={`/blogs/${post.slug}`}
                className="rounded-2xl border border-slate-200 bg-white/80 p-4 transition hover:border-blue-300 hover:bg-white dark:border-blue-400/20 dark:bg-blue-950/30 dark:hover:bg-blue-950/45"
              >
                <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {post.title}
                </div>
                {post.excerpt ? (
                  <p className="mt-1 text-sm text-slate-600 dark:text-blue-100/70">
                    {post.excerpt}
                  </p>
                ) : null}
              </Link>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
