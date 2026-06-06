"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import TextArea from "@/components/TextArea";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_FILTERS = ["all", "approved", "pending", "rejected"];

const CATEGORY_LABELS = {
  entrance_pass:   "Entrance Pass",
  nursing_student: "Nursing Student",
  working_nurse:   "Working Nurse",
  abroad_study:    "Abroad Study",
  abroad_work:     "Abroad Work",
};

const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS);

const POST_TYPE_OPTIONS = [
  { value: "normal",          label: "Normal" },
  { value: "reality_check",   label: "Reality Check 🔥" },
  { value: "hospital_diary",  label: "Hospital Diary 🏥" },
  { value: "country_pathway", label: "Country Pathway 🌍" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(value) {
  const date = new Date(value || 0);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function statusStyle(status) {
  if (status === "approved") return "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-200";
  if (status === "pending")  return "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-200";
  if (status === "rejected") return "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-200";
  return "bg-slate-100 text-slate-600";
}

function selectClass(hasError = false) {
  return `w-full rounded-2xl border px-4 py-2.5 text-sm font-semibold outline-none focus:ring-4 transition ${
    hasError
      ? "border-red-400 bg-red-50 text-red-700 focus:border-red-400 focus:ring-red-500/15"
      : "border-slate-200 bg-white/80 text-slate-700 focus:border-blue-400 focus:ring-blue-500/15 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100"
  }`;
}

async function uploadFile(file) {
  const form = new FormData();
  form.append("file", file);
  const res  = await fetch("/api/upload", { method: "POST", body: form });
  const data = await res.json().catch(() => null);
  if (!data?.ok) throw new Error(data?.error || "Upload failed");
  return data.url;
}

// ─── Official Post Form ───────────────────────────────────────────────────────

function OfficialPostForm({ onCreated }) {
  const [busy,         setBusy]         = useState(false);
  const [coverImage,   setCoverImage]   = useState("");
  const [contentHtml,  setContentHtml]  = useState("");
  const [msg,          setMsg]          = useState(null);
  const [fieldErrors,  setFieldErrors]  = useState({});
  const coverRef = useRef(null);

  const uploadCover = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadFile(file);
      setCoverImage(url);
    } catch (err) {
      setMsg({ text: err.message, ok: false });
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setFieldErrors({});

    const form     = new FormData(e.currentTarget);
    const title    = String(form.get("title")    || "").trim();
    const excerpt  = String(form.get("excerpt")  || "").trim();
    const category = String(form.get("category") || "").trim();
    const postType = String(form.get("postType") || "normal");
    const readTime = String(form.get("readTime") || "5 min read").trim();

    // simple content from textarea if no rich editor
    const rawContent = String(form.get("content") || "").trim();
    const content    = contentHtml || (rawContent ? `<p>${rawContent.replace(/\n/g, "</p><p>")}</p>` : "");

    const errors = {};
    if (!title)    errors.title    = "Title is required";
    if (!excerpt)  errors.excerpt  = "Excerpt is required";
    if (!category) errors.category = "Category is required";
    if (!content)  errors.content  = "Content is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setBusy(true);
    try {
      const res  = await fetch("/api/admin/posts", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          title,
          excerpt,
          category,
          postType,
          readTime,
          coverImage,
          contentHtml: content,
          // no tags, no flair, no anonymous — official post
        }),
      });
      const data = await res.json().catch(() => null);

      if (!data?.ok) {
        setMsg({ text: data?.error || "Failed to create post.", ok: false });
        if (data?.fields) setFieldErrors(data.fields);
        return;
      }

      // reset form
      e.target.reset();
      setCoverImage("");
      setContentHtml("");
      setMsg({ text: "✓ Official post published as Nursing Nepal!", ok: true });
      onCreated?.();
    } catch {
      setMsg({ text: "Something went wrong. Try again.", ok: false });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-3xl border border-blue-200 bg-blue-50/40 p-6 dark:border-blue-400/20 dark:bg-blue-950/20">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-extrabold text-white">
          N
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
            Create Official Post
          </h3>
          <p className="text-xs text-slate-500 dark:text-blue-100/50">
            Published as <span className="font-bold text-blue-600">Nursing Nepal</span> — your identity stays hidden
          </p>
        </div>
      </div>

      <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={uploadCover} />

      <form onSubmit={handleSubmit} className="grid gap-4">

        {/* Title */}
        <div>
          <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
            Title <span className="text-red-500">*</span>
          </label>
          <div className="mt-1.5">
            <Input
              name="title"
              placeholder="Post title"
              hasError={!!fieldErrors.title}
            />
            {fieldErrors.title && <p className="mt-1 text-xs text-red-600">{fieldErrors.title}</p>}
          </div>
        </div>

        {/* Excerpt */}
        <div>
          <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
            Excerpt <span className="text-red-500">*</span>
          </label>
          <div className="mt-1.5">
            <TextArea
              name="excerpt"
              placeholder="Short description shown in blog cards"
              hasError={!!fieldErrors.excerpt}
            />
            {fieldErrors.excerpt && <p className="mt-1 text-xs text-red-600">{fieldErrors.excerpt}</p>}
          </div>
        </div>

        {/* Category + Post Type */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="mt-1.5">
              <select name="category" className={selectClass(!!fieldErrors.category)}>
                <option value="">Select category</option>
                {CATEGORY_OPTIONS.map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
              {fieldErrors.category && <p className="mt-1 text-xs text-red-600">{fieldErrors.category}</p>}
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
              Post Type
            </label>
            <div className="mt-1.5">
              <select name="postType" className={selectClass()}>
                {POST_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Read Time */}
        <div className="max-w-xs">
          <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">Read Time</label>
          <div className="mt-1.5">
            <Input name="readTime" defaultValue="5 min read" placeholder="5 min read" />
          </div>
        </div>

        {/* Cover Image */}
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white/60 p-4 dark:border-blue-400/20">
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">Cover Image</p>
            <p className="text-xs text-slate-400">Optional but recommended</p>
          </div>
          <div className="flex gap-2">
            <Button type="button" disabled={busy} onClick={() => coverRef.current?.click()}>
              {coverImage ? "Change" : "Upload"}
            </Button>
            {coverImage && (
              <button
                type="button"
                onClick={() => setCoverImage("")}
                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100"
              >
                Remove
              </button>
            )}
          </div>
        </div>
        {coverImage && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={coverImage} alt="Cover" className="h-36 w-full rounded-2xl object-cover" />
        )}

        {/* Content */}
        <div>
          <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
            Content <span className="text-red-500">*</span>
          </label>
          <div className="mt-1.5">
            <textarea
              name="content"
              rows={8}
              placeholder="Write the post content here..."
              className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-white dark:placeholder:text-blue-100/30"
            />
            {fieldErrors.content && <p className="mt-1 text-xs text-red-600">{fieldErrors.content}</p>}
          </div>
        </div>

        {/* Message */}
        {msg && (
          <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
            msg.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/20 dark:text-emerald-300"
              : "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-950/20 dark:text-red-300"
          }`}>
            {msg.text}
          </div>
        )}

        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "Publishing..." : "Publish as Nursing Nepal"}
        </Button>
      </form>
    </div>
  );
}

// ─── Community Posts (moderation) ────────────────────────────────────────────

function CommunityPosts() {
  const [posts,        setPosts]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [busyId,       setBusyId]       = useState(null);
  const [msg,          setMsg]          = useState(null);
  const [query,        setQuery]        = useState("");
  const [statusFilter, setStatus]       = useState("all");
  const [flaggedOnly,  setFlagged]      = useState(false);
  const [page,         setPage]         = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);

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
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      if (!data?.ok) { setMsg(data?.error || "Failed to update"); return; }
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
      setMsg("Failed to delete");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
      {/* Header */}
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
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search posts..." />
          <Button type="submit" disabled={loading || Boolean(busyId)}>Search</Button>
          <Button type="button" disabled={loading || Boolean(busyId)} onClick={() => load()}>↺</Button>
        </form>
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => { setStatus(f); setPage(1); load(query, f, flaggedOnly, 1); }}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition
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
          className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition
            ${flaggedOnly ? "bg-red-600 text-white border-red-600" : "border-slate-200 text-slate-600 dark:border-blue-400/20 dark:text-blue-100/70"}`}
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

      {/* Posts */}
      {loading ? (
        <div className="mt-5 flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500 dark:border-blue-400/20">
          No posts found.
        </div>
      ) : (
        <>
          <div className="mt-5 divide-y divide-slate-100 dark:divide-blue-400/10">
            {posts.map((post) => {
              const isBusy = busyId === post._id;
              return (
                <div key={post._id} className="py-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                        {post.title}
                      </p>
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
                          🚩 Flagged
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
                      <span>{CATEGORY_LABELS[post.category] || post.category || "—"}</span>
                      <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                      <span>{post.views || 0} views</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 shrink-0">
                    {post.status !== "approved" && (
                      <button type="button" disabled={isBusy}
                        onClick={() => updatePost(post._id, { status: "approved" })}
                        className="rounded-xl border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700 hover:bg-green-100 disabled:opacity-60 dark:border-green-400/30 dark:bg-green-500/15 dark:text-green-200">
                        Approve
                      </button>
                    )}
                    {post.status !== "rejected" && (
                      <button type="button" disabled={isBusy}
                        onClick={() => updatePost(post._id, { status: "rejected" })}
                        className="rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-1.5 text-xs font-bold text-yellow-700 hover:bg-yellow-100 disabled:opacity-60">
                        Reject
                      </button>
                    )}
                    <button type="button" disabled={isBusy}
                      onClick={() => updatePost(post._id, { isFlagged: !post.isFlagged })}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-bold disabled:opacity-60 transition
                        ${post.isFlagged
                          ? "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-blue-400/20 dark:bg-blue-950/30"
                          : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-400/30 dark:bg-red-500/15 dark:text-red-200"
                        }`}>
                      {post.isFlagged ? "Unflag" : "Flag"}
                    </button>
                    <button type="button" disabled={isBusy}
                      onClick={() => deletePost(post._id)}
                      className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 disabled:opacity-60 dark:border-red-400/30 dark:bg-red-500/15 dark:text-red-200">
                      {isBusy ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <button type="button" disabled={page <= 1 || loading}
                onClick={() => { setPage(page - 1); load(query, statusFilter, flaggedOnly, page - 1); }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold disabled:opacity-40 dark:border-blue-400/20">
                ← Previous
              </button>
              <span className="text-xs text-slate-500 dark:text-blue-100/50">
                Page {page} of {totalPages}
              </span>
              <button type="button" disabled={page >= totalPages || loading}
                onClick={() => { setPage(page + 1); load(query, statusFilter, flaggedOnly, page + 1); }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold disabled:opacity-40 dark:border-blue-400/20">
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export default function AdminPostsPanel() {
  const [activeTab, setActiveTab] = useState("official");
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="grid gap-6">
      {/* Tab switcher */}
      <div className="flex gap-2 rounded-2xl border border-slate-200 bg-white/70 p-1.5 w-fit shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
        <button
          type="button"
          onClick={() => setActiveTab("official")}
          className={`rounded-xl px-5 py-2 text-sm font-bold transition ${
            activeTab === "official"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 dark:text-blue-100/70 dark:hover:bg-blue-950/40"
          }`}
        >
          ✦ Official Posts
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("community")}
          className={`rounded-xl px-5 py-2 text-sm font-bold transition ${
            activeTab === "community"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 dark:text-blue-100/70 dark:hover:bg-blue-950/40"
          }`}
        >
          👥 Community Posts
        </button>
      </div>

      {activeTab === "official" && (
        <OfficialPostForm onCreated={() => setRefreshKey((k) => k + 1)} />
      )}
      {activeTab === "community" && (
        <CommunityPosts key={refreshKey} />
      )}
    </div>
  );
}