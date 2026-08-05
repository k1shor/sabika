"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CATEGORY_LABELS, formatPostDate } from "./blogToolbarUtils";

function getAuthorDisplay(post) {
  if (post.isOfficialPost) return { name: "Nursing Nepal", initial: "N" };
  if (post.isAnonymous) return { name: "Anonymous Nurse", initial: "?" };

  const name = post.authorId?.name || "Unknown Writer";
  return { name, initial: name[0]?.toUpperCase() || "N" };
}

function AuthorAvatar({ post, authorName, authorInitial }) {
  if (post.isOfficialPost) {
    return (
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#C8102E] text-[10px] font-medium text-white dark:bg-[#E85D6B] dark:text-[#14151A]">
        N
      </div>
    );
  }

  if (!post.isAnonymous && post.authorId?.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={post.authorId.avatarUrl}
        alt={authorName}
        className="h-6 w-6 rounded-full object-cover shrink-0"
      />
    );
  }

  return (
    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0B3C6B] text-[10px] font-medium text-white dark:bg-[#5B9BD5] dark:text-[#14151A]">
      {authorInitial}
    </div>
  );
}

export default function BlogCard({ post, index = 0 }) {
  const { name: authorName, initial: authorInitial } = getAuthorDisplay(post);
  const tags = Array.isArray(post.tags) ? post.tags : [];

  const leftBorder = post.isOfficialPost
    ? "border-l-[#C8102E] dark:border-l-[#E85D6B]"
    : "border-l-[#0B3C6B] dark:border-l-[#5B9BD5]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3), ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Link
        href={`/blogs/${encodeURIComponent(post.slug)}`}
        className={`group flex h-full flex-col overflow-hidden rounded-xl border border-[#EBE5DB] bg-white border-l-4 ${leftBorder} shadow-xs transition-all duration-200 hover:border-[#C8102E]/40 hover:border-l-[#C8102E] hover:shadow-md dark:border-[#2C2E38] dark:bg-[#1E2028] dark:hover:border-[#E85D6B]/40 dark:hover:border-l-[#E85D6B]`}
      >
        {post.coverImage && (
          <div className="h-44 w-full overflow-hidden bg-[#FBF8F3] dark:bg-[#14151A]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          </div>
        )}

        <div className="flex flex-1 flex-col p-5 justify-between">
          <div>
            {/* ONE Colored Badge (Category Only) */}
            <div className="flex items-center justify-between gap-2 mb-2">
              {post.category ? (
                <span className="rounded-md bg-[#4F7B62]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#4F7B62] dark:bg-[#6B9B7E]/15 dark:text-[#6B9B7E]">
                  {CATEGORY_LABELS[post.category] || post.category.replace(/_/g, " ")}
                </span>
              ) : (
                <span className="rounded-md bg-[#0B3C6B]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#0B3C6B] dark:bg-[#5B9BD5]/15 dark:text-[#5B9BD5]">
                  Article
                </span>
              )}

              {post.readTime && (
                <span className="text-[11px] text-[#6B6A5C] dark:text-[#A8A69A]">
                  {post.readTime}
                </span>
              )}
            </div>

            {/* Title: Lora serif, 2-line clamp */}
            <h3 className="font-serif text-lg font-medium leading-snug text-[#1C1B29] line-clamp-2 transition-colors duration-200 group-hover:text-[#0B3C6B] dark:text-[#F2F0E9] dark:group-hover:text-[#5B9BD5]">
              {post.title}
            </h3>

            {/* 2-line excerpt */}
            {post.excerpt && (
              <p className="mt-2 text-xs md:text-sm leading-relaxed text-[#6B6A5C] line-clamp-2 dark:text-[#A8A69A]">
                {post.excerpt}
              </p>
            )}

            {/* Tags as plain small gray text (NOT colored pills) */}
            {tags.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-[#6B6A5C] dark:text-[#A8A69A]">
                {tags.slice(0, 4).map((t) => (
                  <span key={t}>#{t}</span>
                ))}
              </div>
            )}
          </div>

          {/* Author Row & Meta */}
          <div className="mt-4 flex items-center justify-between gap-3 pt-3 border-t border-[#EBE5DB] dark:border-[#2C2E38]">
            <div className="flex items-center gap-2 min-w-0">
              <AuthorAvatar post={post} authorName={authorName} authorInitial={authorInitial} />
              <span className="text-xs font-medium text-[#1C1B29] truncate dark:text-[#F2F0E9]">
                {authorName}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0 text-[11px] text-[#6B6A5C] dark:text-[#A8A69A]">
              <span>{formatPostDate(post.publishedAt || post.createdAt)}</span>
              {post.views > 0 && <span>• {post.views} views</span>}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
