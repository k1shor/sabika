"use client";

import { useEffect, useMemo, useState } from "react";
import ArticlesEmptyState from "@/components/blogs/ArticlesEmptyState";
import ArticlesGrid from "@/components/blogs/ArticlesGrid";
import BlogsFilters from "@/components/blogs/BlogsFilters";
import { filterAndSortPosts } from "@/components/blogs/blogToolbarUtils";

const PAGE_SIZE = 9;

export default function BlogsToolbar({ posts = [], tags = [], categories = [], isAuthenticated = false }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [postType, setPostType] = useState("all");
  const [tag, setTag] = useState("all");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () => filterAndSortPosts(posts, { query, category, postType, tag, sort }),
    [posts, query, category, postType, tag, sort]
  );

  useEffect(() => {
    setPage(1);
  }, [query, category, postType, tag, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const hasActiveFilter = category !== "all" || postType !== "all" || tag !== "all" || query;
  const hasNoApprovedPosts = posts.length === 0;

  const clearFilters = () => {
    setQuery("");
    setCategory("all");
    setPostType("all");
    setTag("all");
    setSort("latest");
    setPage(1);
  };

  return (
    <div>
      {/* Search & Sort Header Row */}
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search articles, topics, or authors..."
          className="w-full rounded-xl border border-[#EBE5DB] bg-white px-4 py-2.5 text-xs md:text-sm font-medium text-[#1C1B29] outline-none transition-colors duration-200 focus:border-[#0B3C6B] dark:border-[#2C2E38] dark:bg-[#1E2028] dark:text-[#F2F0E9] dark:placeholder:text-[#A8A69A] dark:focus:border-[#5B9BD5]"
        />
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          className="rounded-xl border border-[#EBE5DB] bg-white px-4 py-2.5 text-xs md:text-sm font-medium text-[#1C1B29] outline-none transition-colors duration-200 focus:border-[#0B3C6B] dark:border-[#2C2E38] dark:bg-[#1E2028] dark:text-[#F2F0E9] dark:focus:border-[#5B9BD5]"
        >
          <option value="latest">Sort: Newest First</option>
          <option value="oldest">Sort: Oldest First</option>
          <option value="popular">Sort: Most Viewed</option>
          <option value="az">Sort: Title A-Z</option>
        </select>
      </div>

      {/* Category Tabs & Tag Dropdown */}
      <BlogsFilters
        categories={categories}
        category={category}
        onCategoryChange={setCategory}
        tags={tags}
        tag={tag}
        onTagChange={setTag}
      />

      {/* Count & Clear Filters Indicator */}
      <div className="mt-4 mb-5 flex items-center justify-between">
        <p className="text-xs text-[#6B6A5C] dark:text-[#A8A69A]">
          Showing <span className="font-medium text-[#1C1B29] dark:text-[#F2F0E9]">{filtered.length}</span> of{" "}
          <span className="font-medium text-[#1C1B29] dark:text-[#F2F0E9]">{posts.length}</span> articles
        </p>
        {hasActiveFilter && (
          <button
            onClick={clearFilters}
            className="text-xs font-medium text-[#C8102E] hover:underline dark:text-[#E85D6B]"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Articles Grid & Pagination */}
      {filtered.length > 0 ? (
        <>
          <ArticlesGrid posts={paginated} isAuthenticated={isAuthenticated} />

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between rounded-xl border border-[#EBE5DB] bg-white px-4 py-3 text-xs font-medium text-[#6B6A5C] dark:border-[#2C2E38] dark:bg-[#1E2028] dark:text-[#A8A69A]">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setPage(currentPage - 1)}
                className="rounded-lg border border-[#EBE5DB] px-3.5 py-1.5 transition hover:bg-[#FBF8F3] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#2C2E38] dark:hover:bg-[#14151A]"
              >
                ← Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setPage(currentPage + 1)}
                className="rounded-lg border border-[#EBE5DB] px-3.5 py-1.5 transition hover:bg-[#FBF8F3] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#2C2E38] dark:hover:bg-[#14151A]"
              >
                Next →
              </button>
            </div>
          )}
        </>
      ) : (
        <ArticlesEmptyState
          hasNoApprovedPosts={hasNoApprovedPosts}
          hasActiveFilter={hasActiveFilter}
          onClear={clearFilters}
        />
      )}
    </div>
  );
}