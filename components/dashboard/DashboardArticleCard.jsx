"use client";

import Link from "next/link";
import { formatDate } from "./dashboardUtils";

export default function DashboardArticleCard({ post }) {
  const authorName = post.isOfficialPost
    ? "Nursing Nepal"
    : post.isAnonymous
      ? "Anonymous"
      : post.authorId?.name || "Unknown Writer";

  const isPubliclyViewable = post.status === "approved";
  const href = isPubliclyViewable
    ? `/blogs/${encodeURIComponent(post.slug)}`
    : `/writers/posts/${encodeURIComponent(post.slug)}/edit`;

  const leftBorderColor = post.isOfficialPost
    ? "border-l-[#C8102E] dark:border-l-[#E85D6B]"
    : "border-l-[#0B3C6B] dark:border-l-[#5B9BD5]";

  return (
    <Link
      href={href}
      className={`group flex gap-4 rounded-xl border border-[#EBE5DB] bg-white p-4 border-l-4 ${leftBorderColor} transition-all duration-200 hover:scale-[1.015] hover:border-[#C8102E]/40 hover:border-l-[#C8102E] dark:border-[#2C2E38] dark:bg-[#1E2028] dark:hover:border-[#E85D6B]/40 dark:hover:border-l-[#E85D6B]`}
    >
      {post.coverImage ? (
        <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-[#FBF8F3] dark:bg-[#14151A]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverImage}
            alt={post.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-lg bg-[#0B3C6B]/10 text-xs font-medium text-[#0B3C6B] dark:bg-[#5B9BD5]/15 dark:text-[#5B9BD5]">
          Article
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {post.category && (
              <span className="rounded-md bg-[#4F7B62]/10 px-2 py-0.5 text-[11px] font-medium text-[#4F7B62] dark:bg-[#6B9B7E]/15 dark:text-[#6B9B7E]">
                {post.category.replace(/_/g, " ")}
              </span>
            )}
            {!isPubliclyViewable && post.status && (
              <span className="rounded-md bg-[#E0A458]/15 px-2 py-0.5 text-[11px] font-medium text-[#E0A458] dark:text-[#F0BE7A]">
                {post.status}
              </span>
            )}
            {post.readTime && (
              <span className="ml-auto text-[11px] text-[#6B6A5C] dark:text-[#A8A69A]">
                {post.readTime}
              </span>
            )}
          </div>

          <h3 className="line-clamp-2 font-serif text-base font-medium leading-snug text-[#1C1B29] transition-colors duration-200 group-hover:text-[#0B3C6B] dark:text-[#F2F0E9] dark:group-hover:text-[#5B9BD5]">
            {post.title}
          </h3>

          {post.excerpt && (
            <p className="mt-1 line-clamp-1 text-xs text-[#6B6A5C] dark:text-[#A8A69A]">
              {post.excerpt}
            </p>
          )}
        </div>

        <div className="mt-2 flex items-center gap-2 text-[11px] text-[#6B6A5C] dark:text-[#A8A69A]">
          <span className="font-medium text-[#1C1B29] dark:text-[#F2F0E9]">
            {authorName}
          </span>
          <span>•</span>
          <span>{formatDate(post.publishedAt || post.createdAt)}</span>
          <span className="ml-auto">{post.views || 0} views</span>
        </div>
      </div>
    </Link>
  );
}