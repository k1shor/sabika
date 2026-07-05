"use client";

import Link from "next/link";

export default function SavedPostList({ posts }) {
  return (
    <div className="mt-6 grid gap-3">
      {posts.map((post) => (
        <Link
          key={post._id || post.slug}
          href={`/blogs/${post.postId?.slug}`}
          className="rounded-2xl border border-slate-200 bg-white/80 p-4 transition hover:border-blue-300 hover:bg-white dark:border-blue-400/20 dark:bg-blue-950/30 dark:hover:bg-blue-950/45"
        >
          <div className="text-sm font-extrabold text-slate-900 dark:text-white">
            {post.postId?.title}
          </div>
          {post.excerpt ? (
            <p className="mt-1 text-sm text-slate-600 dark:text-blue-100/70">
              {post.postId?.excerpt}
            </p>
          ) : null}
        </Link>
      ))}
    </div>
  );
}
