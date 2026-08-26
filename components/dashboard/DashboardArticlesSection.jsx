"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import DashboardArticleCard from "./DashboardArticleCard";
import { DASHBOARD_ARTICLES_PAGE_SIZE } from "./dashboardUtils";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
];

function getPostDate(post) {
  return new Date(post?.publishedAt || post?.createdAt || 0).getTime();
}

export default function DashboardArticlesSection({ posts, myPosts, user, loading }) {
  const [view, setView] = useState("latest");
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);

  const visiblePosts = useMemo(() => {
    let source;
    if (view === "mine") {
      source = myPosts;
    } else if (view === "official") {
      source = posts.filter((post) => post.isOfficialPost);
    } else {
      source = posts.filter((post) => !post.isOfficialPost);
    }

    return [...source].sort((a, b) => {
      const diff = getPostDate(b) - getPostDate(a);
      return sort === "newest" ? diff : -diff;
    });
  }, [myPosts, posts, sort, view]);

  const totalPages = Math.max(1, Math.ceil(visiblePosts.length / DASHBOARD_ARTICLES_PAGE_SIZE));
  const start = (page - 1) * DASHBOARD_ARTICLES_PAGE_SIZE;
  const pagePosts = visiblePosts.slice(start, start + DASHBOARD_ARTICLES_PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [sort, view]);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  if (loading) return <ArticleSkeletons />;

  const viewTitles = {
    latest: "Latest Community Articles",
    official: "Nursing Nepal Updates",
    mine: "Your Articles",
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-xl font-medium tracking-tight text-[#1C1B29] dark:text-[#F2F0E9]">
            {viewTitles[view]}
          </h2>
          <p className="mt-0.5 text-xs text-[#6B6A5C] dark:text-[#A8A69A]">
            {visiblePosts.length} article{visiblePosts.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setView("latest")}
            className={tabClass(view === "latest")}
          >
            Latest Articles
          </button>
          <button
            type="button"
            onClick={() => setView("official")}
            className={tabClass(view === "official")}
          >
            Nursing Nepal
          </button>
          <button
            type="button"
            onClick={() => setView("mine")}
            className={tabClass(view === "mine")}
          >
            Your Articles
          </button>

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="rounded-xl border border-[#EBE5DB] bg-white px-3 py-1.5 text-xs font-medium text-[#1C1B29] outline-none transition-colors duration-200 focus:border-[#0B3C6B] dark:border-[#2C2E38] dark:bg-[#1E2028] dark:text-[#F2F0E9] dark:focus:border-[#5B9BD5]"
          >
            <option value="">Filter Order</option>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {pagePosts.length === 0 ? (
        <EmptyArticlesNotice view={view} user={user} />
      ) : (
        <>
          {/* Static rendering of dashboard data loop */}
          <div className="flex flex-col gap-3">
            {pagePosts.map((post) => (
              <DashboardArticleCard key={post._id || post.slug} post={post} />
            ))}
          </div>

          <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </section>
  );
}

function tabClass(active) {
  return `rounded-xl px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
    active
      ? "bg-[#0B3C6B] text-white dark:bg-[#5B9BD5] dark:text-[#14151A]"
      : "border border-[#EBE5DB] bg-white text-[#6B6A5C] hover:bg-[#FBF8F3] hover:text-[#1C1B29] dark:border-[#2C2E38] dark:bg-[#1E2028] dark:text-[#A8A69A] dark:hover:bg-[#14151A] dark:hover:text-[#F2F0E9]"
  }`;
}

function PaginationControls({ page, totalPages, onPageChange }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[#EBE5DB] bg-white px-4 py-2.5 text-xs font-medium text-[#6B6A5C] dark:border-[#2C2E38] dark:bg-[#1E2028] dark:text-[#A8A69A]">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange((current) => Math.max(1, current - 1))}
        className="rounded-lg border border-[#EBE5DB] px-3 py-1 text-xs transition hover:bg-[#FBF8F3] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#2C2E38] dark:hover:bg-[#14151A]"
      >
        Previous
      </button>
      <span>
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange((current) => Math.min(totalPages, current + 1))}
        className="rounded-lg border border-[#EBE5DB] px-3 py-1 text-xs transition hover:bg-[#FBF8F3] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#2C2E38] dark:hover:bg-[#14151A]"
      >
        Next
      </button>
    </div>
  );
}

function ArticleSkeletons() {
  return (
    <div className="flex flex-col gap-3">
      {[...Array(DASHBOARD_ARTICLES_PAGE_SIZE)].map((_, index) => (
        <div
          key={index}
          className="h-28 rounded-xl border border-[#EBE5DB] bg-white/60 animate-pulse dark:border-[#2C2E38] dark:bg-[#1E2028]/60"
        />
      ))}
    </div>
  );
}

function EmptyArticlesNotice({ view, user }) {
  const isMine = view === "mine";
  const isOfficial = view === "official";

  return (
    <div className="rounded-xl border border-dashed border-[#EBE5DB] bg-white/50 p-10 text-center dark:border-[#2C2E38] dark:bg-[#1E2028]/50">
      <p className="text-sm font-medium text-[#6B6A5C] dark:text-[#A8A69A]">
        {isMine
          ? "You have not written any articles yet."
          : isOfficial
          ? "No official Nursing Nepal posts yet."
          : "No articles from other writers yet."}
      </p>
      {isMine && user?.role === "blog_writer" && user?.writerVerification?.status === "approved" && (
        <Link
          href="/writers/posts"
          className="mt-3 inline-block text-sm font-medium text-[#C8102E] hover:underline dark:text-[#E85D6B]"
        >
          Write your first article
        </Link>
      )}
      {isMine && user?.role === "blog_writer" && user?.writerVerification?.status === "pending" && (
        <p className="mt-3 text-sm font-medium text-[#E0A458] dark:text-[#F0BE7A]">
          Your writer application is under review.
        </p>
      )}
    </div>
  );
}