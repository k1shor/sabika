"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { STATUS_FILTERS, CATEGORY_LABELS, formatDate, statusStyle } from "../utils/postUtils";
import { fetchAdminPosts, updateAdminPost, deleteAdminPost } from "../services/postService";

export default function CommunityPostsList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState(null);
  const [query, setQuery] = useState("");
  const searchParams = useSearchParams();
  const [statusFilter, setStatus] = useState(searchParams.get("status") || "all");
  const [flaggedOnly, setFlagged] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [counts, setCounts] = useState({ all: 0, approved: 0, pending: 0, rejected: 0, flagged: 0 });

  const load = async (
    search = query,
    status = statusFilter,
    flagged = flaggedOnly,
    nextPage = page
  ) => {
    setLoading(true);
    setMsg(null);
    try {
      const data = await fetchAdminPosts({
        q: search,
        status,
        flagged,
        page: nextPage,
      });

      if (!data?.ok) {
        setMsg(data?.error || "Failed to load posts");
        setPosts([]);
        return;
      }

      setPosts(Array.isArray(data.posts) ? data.posts : []);
      setTotalPages(data.pagination?.totalPages || 1);
      if (data.counts) setCounts(data.counts);
    } catch {
      setMsg("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    load(query, statusFilter, flaggedOnly, 1);
  };

  const updatePost = async (id, body) => {
    setBusyId(id);
    setMsg(null);
    try {
      const data = await updateAdminPost(id, body);
      if (!data?.ok) {
        setMsg(data?.error || "Failed to update");
        return;
      }
      setPosts((list) => list.map((post) => (post._id === id ? { ...post, ...data.post } : post)));
      setMsg("Post updated.");
    } catch {
      setMsg("Failed to update post");
    } finally {
      setBusyId(null);
    }
  };

  const deletePost = async (id) => {
    if (!confirm("Permanently delete this post?")) return;
    setBusyId(id);
    try {
      const data = await deleteAdminPost(id);
      if (!data?.ok) {
        setMsg(data?.error || "Failed to delete");
        return;
      }
      setPosts((list) => list.filter((post) => post._id !== id));
      setMsg("Post deleted.");
    } catch {
      setMsg("Failed to delete");
    } finally {
      setBusyId(null);
    }
  };

  const changeStatusFilter = (nextStatus) => {
    setStatus(nextStatus);
    setPage(1);
    load(query, nextStatus, flaggedOnly, 1);
  };

  const toggleFlaggedOnly = () => {
    const nextFlagged = !flaggedOnly;
    setFlagged(nextFlagged);
    setPage(1);
    load(query, statusFilter, nextFlagged, 1);
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Community Posts
          </h3>
          <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-blue-100/60">
            Moderate posts written by approved writers.
          </p>
        </div>
        <form onSubmit={handleSearch} className="flex w-full gap-2 lg:max-w-sm">
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search posts..." />
          <Button type="submit" disabled={loading || Boolean(busyId)}>Search</Button>
          <Button type="button" disabled={loading || Boolean(busyId)} onClick={() => load()}>
            Refresh
          </Button>
        </form>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => changeStatusFilter(status)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              statusFilter === status
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-slate-200 text-slate-600 dark:border-blue-400/20 dark:text-blue-100/70"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            <span className="ml-1 opacity-70">({counts[status] ?? 0})</span>
          </button>
        ))}
        <button
          type="button"
          onClick={toggleFlaggedOnly}
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
            flaggedOnly
              ? "border-red-600 bg-red-600 text-white"
              : "border-slate-200 text-slate-600 dark:border-blue-400/20 dark:text-blue-100/70"
          }`}
        >
          Flagged only
          <span className="ml-1 opacity-70">({counts.flagged ?? 0})</span>
        </button>
      </div>

      {msg && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100/80">
          {msg}
        </div>
      )}

      {loading ? (
        <div className="mt-5 flex flex-col gap-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500 dark:border-blue-400/20">
          No posts found.
        </div>
      ) : (
        <>
          <div className="mt-5 divide-y divide-slate-100 dark:divide-blue-400/10">
            {posts.map((post) => (
              <PostModerationRow
                key={post._id}
                post={post}
                isBusy={busyId === post._id}
                onUpdate={updatePost}
                onDelete={deletePost}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <PagerButton
                disabled={page <= 1 || loading}
                onClick={() => {
                  const nextPage = page - 1;
                  setPage(nextPage);
                  load(query, statusFilter, flaggedOnly, nextPage);
                }}
              >
                Previous
              </PagerButton>
              <span className="text-xs text-slate-500 dark:text-blue-100/50">
                Page {page} of {totalPages}
              </span>
              <PagerButton
                disabled={page >= totalPages || loading}
                onClick={() => {
                  const nextPage = page + 1;
                  setPage(nextPage);
                  load(query, statusFilter, flaggedOnly, nextPage);
                }}
              >
                Next
              </PagerButton>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PostModerationRow({ post, isBusy, onUpdate, onDelete }) {
  // Only "approved" posts actually exist on the public /blogs/[slug]
  // page -- linking a pending/rejected/draft post there always shows
  // "Article not found". Only render a live link when it's real.
  const isLive = post.status === "approved";

  return (
    <div className="flex flex-col gap-3 py-4 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {isLive ? (
            <Link
              href={`/blogs/${post.slug}`}
              target="_blank"
              className="truncate text-sm font-extrabold text-slate-900 transition hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
            >
              {post.title}
            </Link>
          ) : (
            <span className="truncate text-sm font-extrabold text-slate-900 dark:text-white">
              {post.title}
            </span>
          )}
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusStyle(post.status)}`}>
            {post.status}
          </span>
          {post.isOfficialPost && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
              Official
            </span>
          )}
          {post.isFlagged && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-500/15 dark:text-red-200">
              Flagged
            </span>
          )}
          {post.isAnonymous && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-blue-950/40 dark:text-blue-100/60">
              Anonymous
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-blue-100/50">
          <span>
            By:{" "}
            <span className="font-semibold">
              {post.isOfficialPost ? "Nursing Nepal" : (post.authorId?.name || "Unknown")}
            </span>
          </span>
          <span>{CATEGORY_LABELS[post.category] || post.category || "-"}</span>
          <span>{formatDate(post.publishedAt || post.createdAt)}</span>
          <span>{post.views || 0} views</span>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        {isLive && (
          <Link
            href={`/blogs/${post.slug}`}
            target="_blank"
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100 dark:hover:bg-blue-950/50"
          >
            View
          </Link>
        )}
        {post.status !== "approved" && (
          <button
            type="button"
            disabled={isBusy}
            onClick={() => onUpdate(post._id, { status: "approved" })}
            className="rounded-xl border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700 hover:bg-green-100 disabled:opacity-60 dark:border-green-400/30 dark:bg-green-500/15 dark:text-green-200"
          >
            Approve
          </button>
        )}
        {post.status !== "rejected" && (
          <button
            type="button"
            disabled={isBusy}
            onClick={() => {
              const reason = window.prompt("Reason for rejecting this post (shown to the writer):", "");
              if (reason === null) return;
              onUpdate(post._id, { status: "rejected", rejectionReason: reason.trim() });
            }}
            className="rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-1.5 text-xs font-bold text-yellow-700 hover:bg-yellow-100 disabled:opacity-60 dark:border-yellow-400/30 dark:bg-yellow-500/15 dark:text-yellow-200"
          >
            Reject
          </button>
        )}
        <button
          type="button"
          disabled={isBusy}
          onClick={() => onUpdate(post._id, { isFlagged: !post.isFlagged })}
          className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition disabled:opacity-60 ${
            post.isFlagged
              ? "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100 dark:hover:bg-blue-950/50"
              : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-400/30 dark:bg-red-500/15 dark:text-red-200 dark:hover:bg-red-500/25"
          }`}
        >
          {post.isFlagged ? "Unflag" : "Flag"}
        </button>
        <button
          type="button"
          disabled={isBusy}
          onClick={() => onDelete(post._id)}
          className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 disabled:opacity-60 dark:border-red-400/30 dark:bg-red-500/15 dark:text-red-200 dark:hover:bg-red-500/25"
        >
          {isBusy ? "..." : "Delete"}
        </button>
      </div>
    </div>
  );
}

function PagerButton({ children, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 disabled:opacity-40 dark:border-blue-400/20 dark:text-blue-100"
    >
      {children}
    </button>
  );
}