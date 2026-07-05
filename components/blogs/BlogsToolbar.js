"use client";

import { useMemo, useState } from "react";
import ArticlesEmptyState from "@/components/blogs/ArticlesEmptyState";
import ArticlesGrid from "@/components/blogs/ArticlesGrid";
import BlogsFilters from "@/components/blogs/BlogsFilters";
import { filterAndSortPosts, getPostTypes } from "@/components/blogs/blogToolbarUtils";

export default function BlogsToolbar({ posts = [], tags = [], categories = [] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [postType, setPostType] = useState("all");
  const [tag, setTag] = useState("all");
  const [sort, setSort] = useState("latest");

  const postTypes = useMemo(() => getPostTypes(posts), [posts]);

  const filtered = useMemo(
    () => filterAndSortPosts(posts, { query, category, postType, tag, sort }),
    [posts, query, category, postType, tag, sort]
  );

  const hasActiveFilter = category !== "all" || postType !== "all" || tag !== "all" || query;
  const hasNoApprovedPosts = posts.length === 0;

  const clearFilters = () => {
    setQuery("");
    setCategory("all");
    setPostType("all");
    setTag("all");
    setSort("latest");
  };

  return (
    <div>
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search articles, topics, or authors..."
          className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/15 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-white dark:placeholder:text-blue-100/50"
        />
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/15 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-white"
        >
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
          <option value="popular">Most Viewed</option>
          <option value="az">A to Z</option>
        </select>
      </div>

      <BlogsFilters
        categories={categories}
        category={category}
        onCategoryChange={setCategory}
        postTypes={postTypes}
        postType={postType}
        onPostTypeChange={setPostType}
        tags={tags}
        tag={tag}
        onTagChange={setTag}
      />

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-600 dark:text-blue-100/70">
          Showing <span className="font-extrabold text-slate-900 dark:text-white">{filtered.length}</span> of{" "}
          <span className="font-extrabold text-slate-900 dark:text-white">{posts.length}</span> articles
        </p>
        {hasActiveFilter && (
          <button onClick={clearFilters} className="text-xs font-bold text-slate-400 transition hover:text-red-500 dark:text-blue-100/40 dark:hover:text-red-400">
            Clear filters
          </button>
        )}
      </div>

      {filtered.length > 0 ? (
        <ArticlesGrid posts={filtered} />
      ) : (
        <ArticlesEmptyState hasNoApprovedPosts={hasNoApprovedPosts} hasActiveFilter={hasActiveFilter} onClear={clearFilters} />
      )}
    </div>
  );
}
