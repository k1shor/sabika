"use client";

import { useMemo, useState } from "react";
import BlogCard from "./BlogCard";

const CATEGORY_LABELS = {
  entrance_pass:   "Entrance Pass",
  nursing_student: "Nursing Student",
  working_nurse:   "Working Nurse",
  abroad_study:    "Abroad Study",
  abroad_work:     "Abroad Work",
};

const POST_TYPE_LABELS = {
  normal:           "General",
  reality_check:    "Reality Check",
  hospital_diary:   "Hospital Diary",
  country_pathway:  "Country Pathway",
};

export default function BlogsToolbar({ posts = [], tags = [], categories = [] }) {
  const [query,    setQuery]    = useState("");
  const [category, setCategory] = useState("all");
  const [postType, setPostType] = useState("all");
  const [tag,      setTag]      = useState("all");
  const [sort,     setSort]     = useState("latest");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = [...posts];

    // filter by category
    if (category !== "all") {
      list = list.filter((p) => p.category === category);
    }

    // filter by postType
    if (postType !== "all") {
      list = list.filter((p) => p.postType === postType);
    }

    // filter by tag/flair
    if (tag !== "all") {
      list = list.filter((p) => Array.isArray(p.tags) && p.tags.includes(tag));
    }

    // text search
    if (q) {
      list = list.filter((p) => {
        const text = [
          p.title,
          p.excerpt,
          p.category,
          p.postType,
          Array.isArray(p.tags) ? p.tags.join(" ") : "",
          p.authorId?.name || "",
        ].filter(Boolean).join(" ").toLowerCase();
        return text.includes(q);
      });
    }

    // sort
    list.sort((a, b) => {
      const da = new Date(a.publishedAt || a.createdAt || 0).getTime();
      const db = new Date(b.publishedAt || b.createdAt || 0).getTime();
      if (sort === "latest")  return db - da;
      if (sort === "oldest")  return da - db;
      if (sort === "popular") return (b.views || 0) - (a.views || 0);
      if (sort === "az")      return (a.title || "").localeCompare(b.title || "");
      return 0;
    });

    return list;
  }, [posts, query, category, postType, tag, sort]);

  // derive unique postTypes from actual posts
  const postTypes = Array.from(
    new Set(posts.map((p) => p.postType).filter(Boolean))
  );

  const hasActiveFilter = category !== "all" || postType !== "all" || tag !== "all" || query;

  const clearFilters = () => {
    setQuery("");
    setCategory("all");
    setPostType("all");
    setTag("all");
    setSort("latest");
  };

  return (
    <div>
      {/* Search + Sort row */}
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles, topics, or authors..."
          className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/15 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-white dark:placeholder:text-blue-100/50"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/15 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-white"
        >
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
          <option value="popular">Most Viewed</option>
          <option value="az">A → Z</option>
        </select>
      </div>

      {/* Filter chips row */}
      <div className="mt-3 flex flex-wrap gap-2">

        {/* Category filter */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategory("all")}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition
                ${category === "all"
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-blue-400/20 dark:text-blue-100/70"
                }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c === category ? "all" : c)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition
                  ${category === c
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-blue-400/20 dark:text-blue-100/70"
                  }`}
              >
                {CATEGORY_LABELS[c] || c.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* PostType + Tag filters */}
      {(postTypes.length > 1 || tags.length > 0) && (
        <div className="mt-2 flex flex-wrap gap-2">
          {/* PostType */}
          {postTypes.length > 1 && postTypes.map((pt) => (
            <button
              key={pt}
              onClick={() => setPostType(pt === postType ? "all" : pt)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition
                ${postType === pt
                  ? "border-purple-600 bg-purple-600 text-white"
                  : "border-slate-200 text-slate-500 hover:border-slate-300 dark:border-blue-400/20 dark:text-blue-100/50"
                }`}
            >
              {POST_TYPE_LABELS[pt] || pt}
            </button>
          ))}

          {/* Tags/flairs */}
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setTag(t === tag ? "all" : t)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition
                ${tag === t
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-slate-200 text-slate-500 hover:border-slate-300 dark:border-blue-400/20 dark:text-blue-100/50"
                }`}
            >
              #{t}
            </button>
          ))}
        </div>
      )}

      {/* Results count + clear */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-600 dark:text-blue-100/70">
          Showing{" "}
          <span className="font-extrabold text-slate-900 dark:text-white">{filtered.length}</span>
          {" "}of{" "}
          <span className="font-extrabold text-slate-900 dark:text-white">{posts.length}</span>
          {" "}articles
        </p>
        {hasActiveFilter && (
          <button
            onClick={clearFilters}
            className="text-xs font-bold text-slate-400 hover:text-red-500 transition dark:text-blue-100/40 dark:hover:text-red-400"
          >
            Clear filters ✕
          </button>
        )}
      </div>

      {/* Blog grid */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {filtered.map((p) => (
          <BlogCard key={p._id || p.slug} post={p} />
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white/70 p-10 text-center shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
          <div className="text-3xl mb-3">🔍</div>
          <div className="text-lg font-extrabold text-slate-900 dark:text-white">
            No articles found
          </div>
          <div className="mt-2 text-sm text-slate-600 dark:text-blue-100/75">
            Try a different keyword, category, or clear filters.
          </div>
          {hasActiveFilter && (
            <button
              onClick={clearFilters}
              className="mt-4 rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-blue-700 transition"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}