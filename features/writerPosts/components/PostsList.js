"use client";

import Link from "next/link";
import { useState } from "react";
import Button from "@/components/Button";
import { publishDraft as publishDraftRequest, deletePostBySlug } from "../services/postService";
import { statusBadge, formatDate } from "../utils/postUtils";

// onResult receives { ok, message, refresh } -- same shape as
// CreatePostForm, so the parent handles both with one callback.
export default function PostsList({ posts, loading, onResult, onRefresh }) {
  const [busySlug, setBusySlug] = useState(null);

  const publishDraft = async (slug) => {
    setBusySlug(slug);
    try {
      const data = await publishDraftRequest(slug);
      if (!data?.ok) { onResult({ ok: false, message: data?.error || "Failed to publish.", refresh: false }); return; }
      onResult({ ok: true, message: data.message || "Post published.", refresh: true });
    } catch {
      onResult({ ok: false, message: "Failed to publish.", refresh: false });
    } finally {
      setBusySlug(null);
    }
  };

  const deletePost = async (slug) => {
    if (!confirm("Delete this post?")) return;
    setBusySlug(slug);
    try {
      const data = await deletePostBySlug(slug);
      if (!data?.ok) { onResult({ ok: false, message: data?.error || "Delete failed.", refresh: false }); return; }
      onResult({ ok: true, message: "Post deleted.", refresh: true });
    } catch {
      onResult({ ok: false, message: "Delete failed.", refresh: false });
    } finally {
      setBusySlug(null);
    }
  };

  return (
    <div className="min-w-0 rounded-3xl border border-slate-200 bg-white/70 p-5 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
          Your Posts
        </h2>
        <Button type="button" disabled={loading} onClick={onRefresh}>Refresh</Button>
      </div>

      {posts.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm font-semibold text-slate-500 dark:border-blue-400/20 dark:text-blue-100/50">
          No posts yet. Write your first one!
        </div>
      ) : (
        <div className="mt-5 grid gap-3 px-1 pb-1">
          {posts.map((post) => {
            const isBusy = busySlug === post.slug;
            return (
              <div
                key={post._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/30"
              >
                <div className="flex min-w-0 items-start justify-between gap-2">
                  <div className="min-w-0 flex-1 overflow-hidden">
                    {post.status === "draft" ? (
                      <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-sm font-extrabold text-slate-900 dark:text-white">
                        {post.title}
                      </span>
                    ) : (
                      <Link
                        href={`/blogs/${post.slug}`}
                        className="block overflow-hidden text-ellipsis whitespace-nowrap text-sm font-extrabold text-slate-900 hover:text-blue-700 dark:text-white dark:hover:text-blue-300"
                      >
                        {post.title}
                      </Link>
                    )}
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusBadge(post.status)}`}>
                        {post.status}
                      </span>
                      {post.category && (
                        <span className="text-[10px] text-slate-400">
                          {post.category.replace(/_/g, " ")}
                        </span>
                      )}
                      {post.flair && (
                        <span className="text-[10px] font-semibold text-blue-500">
                          {post.flair.replace(/_/g, " ")}
                        </span>
                      )}
                      <span className="w-full text-[10px] text-slate-400">
                        {formatDate(post.publishedAt || post.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    {post.status === "draft" && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => publishDraft(post.slug)}
                        className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-60 dark:border-emerald-400/30 dark:bg-emerald-950/20 dark:text-emerald-300"
                      >
                        {isBusy ? "..." : "Publish"}
                      </button>
                    )}
                    <div className="flex gap-1.5">
                      <Link
                        href={`/writers/posts/${post.slug}/edit`}
                        className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-extrabold text-blue-700 transition hover:bg-blue-100 dark:border-blue-400/30 dark:bg-blue-950/20 dark:text-blue-300"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => deletePost(post.slug)}
                        className="shrink-0 rounded-xl border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-extrabold text-red-700 transition hover:bg-red-100 disabled:opacity-60 dark:border-red-400/30 dark:bg-red-500/15 dark:text-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
                {post.excerpt && (
                  <p className="mt-2 line-clamp-2 overflow-hidden text-xs text-slate-500 dark:text-blue-100/50">
                    {post.excerpt}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}