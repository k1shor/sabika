"use client";

/* eslint-disable @next/next/no-img-element */
import Link       from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter }    from "next/navigation";
import Container        from "@/components/Container";
import Button           from "@/components/Button";
import PostFormFields   from "@/components/posts/PostFormFields";
import { uploadFile, normalizeFieldErrors } from "@/components/posts/postFormUtils";

// ── helpers ──────────────────────────────────────────────
function statusBadge(status) {
  if (status === "approved") return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400";
  if (status === "pending")  return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400";
  if (status === "rejected") return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400";
  return "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400";
}

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

// ── blank form state ─────────────────────────────────────
const EMPTY_FIELDS = {
  title:       "",
  excerpt:     "",
  category:    "",
  postType:    "normal",
  flair:       "",
  tags:        "",
  readTime:    "5 min read",
  coverImage:  "",
  isAnonymous: false,
  contentHtml: "",
};

// ─────────────────────────────────────────────────────────
export default function WriterPostsPage() {
  const router = useRouter();

  const [posts,         setPosts]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [busy,          setBusy]          = useState(false);
  const [message,       setMessage]       = useState(null);
  const [error,         setError]         = useState(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [fieldErrors,   setFieldErrors]   = useState({});
  const [submitStatus,  setSubmitStatus]  = useState("pending");

  // all form fields in one object — PostFormFields reads from here
  const [fields, setFieldsRaw] = useState(EMPTY_FIELDS);
  const setFields = (partial) => setFieldsRaw((prev) => ({ ...prev, ...partial }));

  const coverRef  = useRef(null);
  const inlineRef = useRef(null);

  // ── load posts ────────────────────────────────────────
  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    const res  = await fetch("/api/writers/posts", { cache: "no-store" });
    const data = await res.json().catch(() => null);

    if (!data?.ok) {
      const code = data?.code;
      if (code === "APPROVAL_PENDING")  { router.replace("/dashboard?writer=pending");  return; }
      if (code === "APPROVAL_REJECTED") { router.replace("/dashboard?writer=rejected"); return; }
      if (code === "NOT_APPLIED")       { router.replace("/apply-writer");              return; }
      if (code === "UNAUTHORIZED")      { router.replace("/login");                     return; }
      router.replace("/dashboard");
      return;
    }

    setPosts(Array.isArray(data.posts) ? data.posts : []);
    setFollowerCount(Number(data.followerCount) || 0);
    setLoading(false);
  };

  useEffect(() => { loadPosts(); }, []);

  // ── upload helpers ────────────────────────────────────
  const handleUploadCover = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const url = await uploadFile(file);
      setFields({ coverImage: url });
    } catch (err) {
      setError(err.message || "Cover image upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleUploadInlineImage = () =>
    new Promise((resolve) => {
      const input = inlineRef.current;
      if (!input) return resolve(null);
      const handler = async () => {
        const file = input.files?.[0];
        input.value = "";
        input.removeEventListener("change", handler);
        if (!file) return resolve(null);
        setBusy(true);
        try   { resolve(await uploadFile(file)); }
        catch (err) { setError(err.message || "Image upload failed."); resolve(null); }
        finally { setBusy(false); }
      };
      input.addEventListener("change", handler);
      input.click();
    });

  // ── submit ────────────────────────────────────────────
  const createPost = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setMessage(null);
    setError(null);

    const form     = new FormData(e.currentTarget);
    const title    = String(form.get("title")    || "").trim();
    const excerpt  = String(form.get("excerpt")  || "").trim();
    const category = String(form.get("category") || "").trim();
    const readTime = String(form.get("readTime") || "").trim();
    const flair    = String(form.get("flair")    || "");
    const rawTags  = String(form.get("tags")     || "");
    const tags     = rawTags.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 5);

    const errors = {};
    if (!title)   errors.title    = ["Title is required"];
    if (!excerpt) errors.excerpt  = ["Excerpt is required"];
    if (!category) errors.category = ["Please select a category"];
    if (!fields.contentHtml || fields.contentHtml.trim() === "" || fields.contentHtml === "<p></p>")
      errors.contentHtml = ["Post content cannot be empty"];
    if (tags.some((t) => t.length > 40))
      errors.tags = ["Each tag must be under 40 characters"];

    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }

    setBusy(true);

    const slug = String(form.get("slug") || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-") ||
      title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const payload = {
      title, slug, excerpt,
      coverImage:  fields.coverImage,
      contentHtml: fields.contentHtml,
      category,
      postType:    String(form.get("postType") || "normal"),
      flair,
      tags,
      isAnonymous: fields.isAnonymous,
      readTime:    readTime || "5 min read",
      status:      submitStatus,
      images:      [],
    };

    try {
      const res  = await fetch("/api/writers/posts", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);

      if (!data?.ok) {
        const normalized = normalizeFieldErrors(data?.fields || data?.fieldErrors);
        setFieldErrors(normalized);
        if (Object.keys(normalized).length === 0)
          setError(data?.error || "Post creation failed.");
        return;
      }

      e.target.reset();
      setFieldsRaw(EMPTY_FIELDS);
      setMessage(
        submitStatus === "draft"
          ? "Post saved as draft!"
          : "Post submitted! It will be published shortly."
      );
      await loadPosts();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  };

  // ── delete ────────────────────────────────────────────
  const deletePost = async (slug) => {
    if (!confirm("Delete this post?")) return;
    setBusy(true);
    setMessage(null);
    setError(null);
    const res  = await fetch(`/api/writers/posts/${slug}`, { method: "DELETE" });
    const data = await res.json().catch(() => null);
    setBusy(false);
    if (!data?.ok) { setError(data?.error || "Delete failed."); return; }
    setMessage("Post deleted.");
    await loadPosts();
  };

  // ── loading skeleton ──────────────────────────────────
  if (loading) return (
    <Container>
      <div className="grid gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800" />
        ))}
      </div>
    </Container>
  );

  // ─────────────────────────────────────────────────────
  return (
    <Container>
      <div className="grid gap-4 overflow-hidden sm:gap-6">

        {/* ── Header ── */}
        <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white/70 p-5 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25 sm:p-7 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-sm font-semibold text-slate-600 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100/80">
              <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
              Writer Workspace
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              My Posts
            </h1>
            <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-blue-100/70">
              Approved writers can publish posts. Admins can still moderate any unsafe post.
            </p>
          </div>
          <div className="flex flex-row items-center gap-2 md:grid md:gap-1 md:text-right">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{followerCount}</div>
            <div className="text-sm font-semibold text-slate-600 dark:text-blue-100/70">
              Follower{followerCount === 1 ? "" : "s"}
            </div>
          </div>
        </div>

        {/* ── Global messages ── */}
        {(message || error) && (
          <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
            error
              ? "border-red-200 bg-red-50 text-red-700 dark:border-red-400/30 dark:bg-red-500/15 dark:text-red-200"
              : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/15 dark:text-emerald-200"
          }`}>
            {error || message}
          </div>
        )}

        {/* ── Two-column layout ── */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">

          {/* ── CREATE POST FORM ── */}
          <div className="min-w-0 rounded-3xl border border-slate-200 bg-white/70 p-5 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25 sm:p-6">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              Create Post
            </h2>

            <form onSubmit={createPost} className="mt-5">
              <PostFormFields
                mode="create"
                fields={fields}
                setFields={setFields}
                fieldErrors={fieldErrors}
                busy={busy}
                coverRef={coverRef}
                inlineRef={inlineRef}
                onUploadCover={handleUploadCover}
                onUploadInlineImage={handleUploadInlineImage}
              >
                {/* Action buttons */}
                <div className="flex flex-col gap-2 xs:flex-row sm:flex-row">
                  <button
                    type="submit"
                    disabled={busy}
                    onClick={() => setSubmitStatus("draft")}
                    className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-blue-400/20 dark:bg-blue-950/20 dark:text-blue-100 sm:py-2.5"
                  >
                    {busy && submitStatus === "draft" ? "Saving..." : "Save as Draft"}
                  </button>
                  <button
                    type="submit"
                    disabled={busy}
                    onClick={() => setSubmitStatus("pending")}
                    className="flex-1 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60 sm:py-2.5"
                  >
                    {busy && submitStatus === "pending" ? "Publishing..." : "Publish Post"}
                  </button>
                </div>
              </PostFormFields>
            </form>
          </div>

          {/* ── YOUR POSTS LIST ── */}
          <div className="min-w-0 rounded-3xl border border-slate-200 bg-white/70 p-5 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                Your Posts
              </h2>
              <Button type="button" disabled={busy} onClick={loadPosts}>Refresh</Button>
            </div>

            {posts.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm font-semibold text-slate-500 dark:border-blue-400/20 dark:text-blue-100/50">
                No posts yet. Write your first one!
              </div>
            ) : (
              <div className="mt-5 grid gap-3 px-1 pb-1">
                {posts.map((post) => (
                  <div
                    key={post._id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/30"
                  >
                    <div className="flex min-w-0 items-start justify-between gap-2">
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <Link
                          href={`/blogs/${post.slug}`}
                          className="block overflow-hidden text-ellipsis whitespace-nowrap text-sm font-extrabold text-slate-900 hover:text-blue-700 dark:text-white dark:hover:text-blue-300"
                        >
                          {post.title}
                        </Link>
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
                      <Link
                        href={`/writers/posts/${post.slug}/edit`}
                        className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-extrabold text-blue-700 transition hover:bg-blue-100 dark:border-blue-400/30 dark:bg-blue-950/20 dark:text-blue-300"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => deletePost(post.slug)}
                        className="shrink-0 self-start rounded-xl border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-extrabold text-red-700 transition hover:bg-red-100 disabled:opacity-60 dark:border-red-400/30 dark:bg-red-500/15 dark:text-red-200"
                      >
                        Delete
                      </button>
                    </div>
                    {post.excerpt && (
                      <p className="mt-2 line-clamp-2 overflow-hidden text-xs text-slate-500 dark:text-blue-100/50">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </Container>
  );
}