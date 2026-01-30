"use client";

import { useMemo, useState } from "react";
import BlogCard from "./BlogCard";

export default function BlogsToolbar({ posts = [], tags = [] }) {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("all");
  const [sort, setSort] = useState("latest");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = [...posts];

    if (tag !== "all") {
      list = list.filter((p) => Array.isArray(p.tags) && p.tags.includes(tag));
    }

    if (q) {
      list = list.filter((p) => {
        const text = [
          p.title,
          p.excerpt,
          p.content,
          Array.isArray(p.tags) ? p.tags.join(" ") : "",
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return text.includes(q);
      });
    }

    list.sort((a, b) => {
      const da = new Date(a.publishedAt || a.createdAt || 0).getTime();
      const db = new Date(b.publishedAt || b.createdAt || 0).getTime();

      if (sort === "latest") return db - da;
      if (sort === "oldest") return da - db;
      if (sort === "az") return (a.title || "").localeCompare(b.title || "");
      return 0;
    });

    return list;
  }, [posts, query, tag, sort]);

  return (
    <div>
      <div className="grid gap-3 md:grid-cols-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles (wound care, vital signs, home nursing...)"
          className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-800 outline-none
          focus:ring-4 focus:ring-blue-500/15 focus:border-blue-400
          dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-white dark:placeholder:text-blue-100/50"
        />

        <select
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-800 outline-none
          focus:ring-4 focus:ring-blue-500/15 focus:border-blue-400
          dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-white"
        >
          <option value="all">All Categories</option>
          {tags.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-800 outline-none
          focus:ring-4 focus:ring-blue-500/15 focus:border-blue-400
          dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-white"
        >
          <option value="latest">Sort: Latest</option>
          <option value="oldest">Sort: Oldest</option>
          <option value="az">Sort: A → Z</option>
        </select>
      </div>

      <div className="mt-4 text-sm font-semibold text-slate-600 dark:text-blue-100/70">
        Showing <span className="text-slate-900 dark:text-white">{filtered.length}</span> results
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {filtered.map((p) => (
          <BlogCard key={p.slug} post={p} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white/70 p-8 text-center shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
          <div className="text-lg font-extrabold text-slate-900 dark:text-white">
            No articles found
          </div>
          <div className="mt-2 text-sm text-slate-600 dark:text-blue-100/75">
            Try changing the search keyword or selecting a different category.
          </div>
        </div>
      )}
    </div>
  );
}
