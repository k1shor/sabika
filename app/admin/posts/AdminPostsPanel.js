"use client";

import { useEffect, useState } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";

const STATUS_FILTERS = ["all", "approved", "pending", "rejected"];

const CATEGORY_LABELS = {
  entrance_pass:   "Entrance Pass",
  nursing_student: "Nursing Student",
  working_nurse:   "Working Nurse",
  abroad_study:    "Abroad Study",
  abroad_work:     "Abroad Work",
};

function formatDate(value) {
  const date = new Date(value || 0);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString();
}

function statusStyle(status) {
  if (status === "approved") return "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-200";
  if (status === "pending")  return "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-200";
  if (status === "rejected") return "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-200";
  return "bg-slate-100 text-slate-600";
}

export default function AdminPostsPanel() {
  const [posts, setPosts]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [busyId, setBusyId]       = useState(null);
  const [msg, setMsg]             = useState(null);
  const [query, setQuery]         = useState("");
  const [statusFilter, setStatus] = useState("all");
  const [flaggedOnly, setFlagged] = useState(false);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = async (search = query, s = statusFilter, f = flaggedOnly, p = page) => {
    setLoading(true);
    setMsg(null);
    try {
      const qs = new URLSearchParams();
      if (search.trim()) qs.set("q", search.trim());
      if (s !== "all")   qs.set("status", s);
      if (f)             qs.set("flagged", "true");
      qs.set("page", String(p));

      const res  = await fetch(`/api/admin/posts?${qs}`, { cache: "no-store" });
      const data = await res.json().catch(() => null);
      if (!data?.ok) { setMsg(data?.error || "Failed to load posts"); setPosts([]); return; }
      setPosts(Array.isArray(data.posts) ? data.posts : []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {
      setMsg("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load(query, statusFilter, flaggedOnly, 1);
  };

  const updatePost = async (id, body) => {
    setBusyId(id);
    setMsg(null);
    try {
      const res  = await fetch(`/api/admin/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      if (!data?.ok) { setMsg(data?.error || "Failed to update post"); return; }
      setPosts((list) => list.map((p) => (p._id === id ? { ...p, ...data.post } : p)));
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
      const res  = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => null);
      if (!data?.ok) { setMsg(data?.error || "Failed to delete"); return; }
      setPosts((list) => list.filter((p) => p._id !== id));
      setMsg("Post deleted.");
    } catch {
      setMsg("Failed to delete post");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">

      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Manage Posts
          </h2>
          <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-blue-100/70">
            Review, approve, flag, or delete blog posts.
          </p>
        </div>
        <form onSubmit={handleSearch} className="flex w-full gap-2 lg:max-w-md">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title or author..."
          />
          <Button type="submit" disabled={loading || Boolean(busyId)}>Search</Button>
          <Button type="button" disabled={loading || Boolean(busyId)} onClick={() => load()}>
            Refresh
          </Button>
        </form>
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => { setStatus(f); setPage(1); load(query, f, flaggedOnly, 1); }}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold border transition
              ${statusFilter === f
                ? "bg-blue-600 text-white border-blue-600"
                : "border-slate-200 text-slate-600 dark:border-blue-400/20 dark:text-blue-100/70"
              }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <button
          type="button"
          onClick={() => { setFlagged(!flaggedOnly); setPage(1); load(query, statusFilter, !flaggedOnly, 1); }}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold border transition
            ${flaggedOnly
              ? "bg-red-600 text-white border-red-600"
              : "border-slate-200 text-slate-600 dark:border-blue-400/20 dark:text-blue-100/70"
            }`}
        >
          🚩 Flagged only
        </button>
      </div>

      {/* Message */}
      {msg && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100/80">
          {msg}
        </div>
      )}

      {/* Posts list */}
      {loading ? (
        <div className="mt-5 text-sm font-semibold text-slate-500">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="mt-5 text-sm font-semibold text-slate-500">No posts found.</div>
      ) : (
        <>
          <div className="mt-5 divide-y divide-slate-100 dark:divide-blue-400/10">
            {posts.map((post) => {
              const isBusy = busyId === post._id;
              return (
                <div key={post._id} className="py-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">

                  {/* Post info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                        {post.title}
                      </p>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${statusStyle(post.status)}`}>
                        {post.status}
                      </span>
                      {post.isFlagged && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700 dark:bg-red-500/15 dark:text-red-200">
                          🚩 Flagged
                        </span>
                      )}
                      {post.isAnonymous && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600 dark:bg-blue-950/40 dark:text-blue-100/60">
                          Anonymous
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-blue-100/50">
                      <span>By: {post.authorId?.name || "Unknown"}</span>
                      <span>{CATEGORY_LABELS[post.category] || post.category || "—"}</span>
                      <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                      <span>{post.views || 0} views</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 shrink-0">
                    {/* Approve */}
                    {post.status !== "approved" && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => updatePost(post._id, { status: "approved" })}
                        className="rounded-xl border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700 hover:bg-green-100 disabled:opacity-60 dark:border-green-400/30 dark:bg-green-500/15 dark:text-green-200"
                      >
                        Approve
                      </button>
                    )}

                    {/* Reject */}
                    {post.status !== "rejected" && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => updatePost(post._id, { status: "rejected" })}
                        className="rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-1.5 text-xs font-bold text-yellow-700 hover:bg-yellow-100 disabled:opacity-60"
                      >
                        Reject
                      </button>
                    )}

                    {/* Flag/Unflag */}
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => updatePost(post._id, { isFlagged: !post.isFlagged })}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-bold disabled:opacity-60 transition
                        ${post.isFlagged
                          ? "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100"
                          : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-400/30 dark:bg-red-500/15 dark:text-red-200"
                        }`}
                    >
                      {post.isFlagged ? "Unflag" : "Flag"}
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => deletePost(post._id)}
                      className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 disabled:opacity-60 dark:border-red-400/30 dark:bg-red-500/15 dark:text-red-200"
                    >
                      {isBusy ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => { setPage(page - 1); load(query, statusFilter, flaggedOnly, page - 1); }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold disabled:opacity-40 dark:border-blue-400/20"
              >
                ← Previous
              </button>
              <span className="text-xs text-slate-500 dark:text-blue-100/50">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => { setPage(page + 1); load(query, statusFilter, flaggedOnly, page + 1); }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold disabled:opacity-40 dark:border-blue-400/20"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}