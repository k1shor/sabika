"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Container from "@/components/Container";
import Button from "@/components/Button";
import Input from "@/components/Input";
import TextArea from "@/components/TextArea";
import RichTextEditor from "@/components/RichTextEditor";

const FLAIR_OPTIONS = [
  { value: "",                   label: "No flair"          },
  { value: "tips",               label: "Tips"              },
  { value: "tricks",             label: "Tricks"            },
  { value: "guidance",           label: "Guidance"          },
  { value: "clinical_experience",label: "Clinical Experience"},
  { value: "career_journey",     label: "Career Journey"    },
  { value: "workplace_reality",  label: "Workplace Reality" },
  { value: "story",              label: "Story / Experience"},
];

const normalizeFieldErrors = (errors) => {
  const safe = {};
  if (!errors || typeof errors !== "object") return safe;
  for (const key in errors) {
    if (Array.isArray(errors[key]))          safe[key] = errors[key];
    else if (typeof errors[key] === "string") safe[key] = [errors[key]];
  }
  return safe;
};

const FieldError = ({ errors, field }) => {
  if (!Array.isArray(errors?.[field]) || errors[field].length === 0) return null;
  return (
    <p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-400">
      {errors[field][0]}
    </p>
  );
};

async function uploadFile(file) {
  const form = new FormData();
  form.append("file", file);
  const res  = await fetch("/api/upload", { method: "POST", body: form });
  const data = await res.json().catch(() => null);
  if (!data?.ok) throw new Error(data?.error || "Upload failed");
  return data.url;
}

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

export default function WriterPostsPage() {
  const [posts,        setPosts]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [busy,         setBusy]         = useState(false);
  const [message,      setMessage]      = useState(null);
  const [error,        setError]        = useState(null);
  const [accessError,  setAccessError]  = useState(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [coverImage,   setCoverImage]   = useState("");
  const [contentHtml,  setContentHtml]  = useState("");
  const [fieldErrors,  setFieldErrors]  = useState({});
  const [isAnonymous,  setIsAnonymous]  = useState(false); // ✅ proper state
  const [submitStatus, setSubmitStatus] = useState("pending"); // draft or pending
  const coverRef  = useRef(null);
  const inlineRef = useRef(null);

  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    const res  = await fetch("/api/blogs?mine=true", { cache: "no-store" }); // ✅ use existing route
    const data = await res.json().catch(() => null);
    setLoading(false);
    if (!data?.ok) {
      setAccessError(data?.error || "Unable to load your posts.");
      setPosts([]);
      return;
    }
    setAccessError(null);
    setPosts(Array.isArray(data.posts) ? data.posts : []);
    setFollowerCount(Number(data.followerCount) || 0);
  };

  useEffect(() => { loadPosts(); }, []);

  const uploadCover = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const url = await uploadFile(file);
      setCoverImage(url);
    } catch (err) {
      setError(err.message || "Cover image upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const uploadInlineImage = async () => {
    return new Promise((resolve) => {
      const input = inlineRef.current;
      if (!input) return resolve(null);
      const handler = async () => {
        const file = input.files?.[0];
        input.value = "";
        input.removeEventListener("change", handler);
        if (!file) return resolve(null);
        setBusy(true);
        try {
          const url = await uploadFile(file);
          resolve(url);
        } catch (err) {
          setError(err.message || "Image upload failed.");
          resolve(null);
        } finally {
          setBusy(false);
        }
      };
      input.addEventListener("change", handler);
      input.click();
    });
  };

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

    // parse tags — comma separated
    const tags = rawTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 5); // max 5

    // frontend validation
    const errors = {};
    if (!title)    errors.title    = ["Title is required"];
    if (!excerpt)  errors.excerpt  = ["Excerpt is required"];
    if (!category) errors.category = ["Please select a category"];
    if (!contentHtml || contentHtml.trim() === "" || contentHtml === "<p></p>")
      errors.contentHtml = ["Post content cannot be empty"];
    if (tags.some((t) => t.length > 40))
      errors.tags = ["Each tag must be under 40 characters"];

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setBusy(true);

    const slug = String(form.get("slug") || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-") || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const payload = {
      title,
      slug,
      excerpt,
      coverImage,
      contentHtml,
      category,
      postType:    String(form.get("postType") || "normal"),
      flair,       // ✅ flair field
      tags,
      isAnonymous, // ✅ from state not form checkbox string
      readTime:    readTime || "5 min read",
      status:      submitStatus, // ✅ draft or pending
      images:      [],
    };

    try {
      const res  = await fetch("/api/blogs", { // ✅ use existing /api/blogs
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);

      if (!data?.ok) {
        const normalized = normalizeFieldErrors(data?.fields || data?.fieldErrors);
        const hasFieldErrors = Object.keys(normalized).length > 0;
        setError(hasFieldErrors ? null : data?.error || "Post creation failed.");
        setFieldErrors(normalized);
        return;
      }

      e.target.reset();
      setCoverImage("");
      setContentHtml("");
      setIsAnonymous(false);
      setSubmitStatus("pending");
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

  const deletePost = async (slug) => {
    if (!confirm("Delete this post?")) return;
    setBusy(true);
    setMessage(null);
    setError(null);
    const res  = await fetch(`/api/blogs/${slug}`, { method: "DELETE" });
    const data = await res.json().catch(() => null);
    setBusy(false);
    if (!data?.ok) { setError(data?.error || "Delete failed."); return; }
    setMessage("Post deleted.");
    await loadPosts();
  };

  const selectClass = (hasError) =>
    `w-full rounded-2xl border px-4 py-2.5 text-sm font-semibold outline-none focus:ring-4 transition ${
      hasError
        ? "border-red-400 bg-red-50 text-red-700 focus:border-red-400 focus:ring-red-500/15 dark:border-red-400/50 dark:bg-red-500/10 dark:text-red-200"
        : "border-slate-200 bg-white/80 text-slate-700 focus:border-blue-400 focus:ring-blue-500/15 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100"
    }`;

  return (
    <Container>
      <div className="grid gap-6">

        {/* Header */}
        <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white/70 p-7 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-sm font-semibold text-slate-600 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100/80">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Writer Workspace
            </div>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              My Posts
            </h1>
            
            <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-blue-100/70">
              Approved writers can publish posts. Admins can still moderate any unsafe post.
            </p>
          </div>
          <div className="grid gap-1 text-sm font-semibold text-slate-600 dark:text-blue-100/70 md:text-right">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{followerCount}</div>
            <div>Follower{followerCount === 1 ? "" : "s"}</div>
          </div>
        </div>

        {/* Global messages */}
        {(message || error || accessError) && (
          <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
            error || accessError
              ? "border-red-200 bg-red-50 text-red-700 dark:border-red-400/30 dark:bg-red-500/15 dark:text-red-200"
              : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/15 dark:text-emerald-200"
          }`}>
            {accessError || error || message}
          </div>
        )}

        {accessError ? (
          <div className="rounded-3xl border border-slate-200 bg-white/70 p-7 text-sm font-semibold text-slate-600 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25 dark:text-blue-100/70">
            Login as an approved blog writer to create posts.{" "}
            <Link href="/apply-writer" className="font-extrabold text-blue-700 hover:text-blue-600 dark:text-blue-300">
              Apply as Writer →
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">

            {/* ── CREATE POST FORM ── */}
            <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Create Post
              </h2>

              <input ref={coverRef}  type="file" accept="image/*" className="hidden" onChange={uploadCover} />
              <input ref={inlineRef} type="file" accept="image/*" className="hidden" />

              <form onSubmit={createPost} className="mt-5 grid gap-4">

                {/* Title */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2">
                    <Input
                      name="title"
                      placeholder="Article title"
                      hasError={!!fieldErrors?.title}
                    />
                    <FieldError errors={fieldErrors} field="title" />
                  </div>
                </div>

                {/* Slug */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
                    Custom slug <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <div className="mt-2">
                    <Input name="slug" placeholder="leave blank to auto-generate" />
                    <FieldError errors={fieldErrors} field="slug" />
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
                    Excerpt <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2">
                    <TextArea
                      name="excerpt"
                      placeholder="Short summary shown in blog cards"
                      hasError={!!fieldErrors?.excerpt}
                    />
                    <FieldError errors={fieldErrors} field="excerpt" />
                  </div>
                </div>

                {/* Category + Post Type */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-2">
                      <select name="category" className={selectClass(!!fieldErrors?.category)}>
                        <option value="">Select category</option>
                        <option value="entrance_pass">Entrance Pass</option>
                        <option value="nursing_student">Nursing Student</option>
                        <option value="working_nurse">Working Nurse</option>
                        <option value="abroad_study">Abroad Study</option>
                        <option value="abroad_work">Abroad Work</option>
                      </select>
                      <FieldError errors={fieldErrors} field="category" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
                      Post Type
                    </label>
                    <div className="mt-2">
                      <select name="postType" className={selectClass(false)}>
                        <option value="normal">Normal</option>
                        <option value="reality_check">Reality Check 🔥</option>
                        <option value="hospital_diary">Hospital Diary 🏥</option>
                        <option value="country_pathway">Country Pathway 🌍</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Flair + Read Time */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
                      Flair
                    </label>
                    <div className="mt-2">
                      <select name="flair" className={selectClass(false)}>
                        {FLAIR_OPTIONS.map((f) => (
                          <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                      </select>
                      <FieldError errors={fieldErrors} field="flair" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
                      Read time
                    </label>
                    <div className="mt-2">
                      <Input name="readTime" defaultValue="5 min read" />
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
                    Tags <span className="text-slate-400 font-normal">(comma separated, max 5)</span>
                  </label>
                  <div className="mt-2">
                    <Input name="tags" placeholder="NCLEX, ICU, Nepal nurse, salary" />
                    <FieldError errors={fieldErrors} field="tags" />
                  </div>
                </div>

                {/* Anonymous toggle */}
                <div
                  onClick={() => setIsAnonymous((v) => !v)}
                  className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition ${
                    isAnonymous
                      ? "border-blue-300 bg-blue-50 dark:border-blue-400/30 dark:bg-blue-950/20"
                      : "border-slate-200 bg-white/60 dark:border-blue-400/20 dark:bg-blue-950/10"
                  }`}
                >
                  <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition ${
                    isAnonymous ? "border-blue-600 bg-blue-600" : "border-slate-300"
                  }`}>
                    {isAnonymous && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
                      Post anonymously
                    </p>
                    <p className="text-xs text-slate-500 dark:text-blue-100/50">
                      Your name will be hidden. Only your role will be shown.
                    </p>
                  </div>
                </div>

                {/* Cover Image */}
                <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-blue-400/20 dark:bg-blue-950/25">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-extrabold text-slate-900 dark:text-white">Cover Image</p>
                      <p className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-blue-100/60">
                        Optional — makes the blog card look much better.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" disabled={busy} onClick={() => coverRef.current?.click()}>
                        {busy ? "Uploading..." : coverImage ? "Change" : "Upload Cover"}
                      </Button>
                      {coverImage && (
                        <button
                          type="button"
                          onClick={() => setCoverImage("")}
                          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100 dark:border-red-400/30 dark:bg-red-950/20 dark:text-red-400"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                  {coverImage && (
                    <img src={coverImage} alt="Cover preview" className="mt-4 h-40 w-full rounded-2xl object-cover" />
                  )}
                </div>

                {/* Rich Text Editor */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
                    Content <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2">
                    <RichTextEditor
                      value={contentHtml}
                      onChange={setContentHtml}
                      onUploadImage={uploadInlineImage}
                    />
                    <FieldError errors={fieldErrors} field="contentHtml" />
                  </div>
                </div>

                {/* Field errors summary */}
                {Object.keys(fieldErrors).length > 0 && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-400/30 dark:bg-red-500/15 dark:text-red-200">
                    Please fix the errors above before publishing.
                  </div>
                )}

                {/* Submit buttons — draft or publish */}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={busy}
                    onClick={() => setSubmitStatus("draft")}
                    className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-blue-400/20 dark:bg-blue-950/20 dark:text-blue-100"
                  >
                    {busy && submitStatus === "draft" ? "Saving..." : "Save as Draft"}
                  </button>
                  <button
                    type="submit"
                    disabled={busy}
                    onClick={() => setSubmitStatus("pending")}
                    className="flex-1 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
                  >
                    {busy && submitStatus === "pending" ? "Publishing..." : "Publish Post"}
                  </button>
                </div>

              </form>
            </div>

            {/* ── YOUR POSTS LIST ── */}
            <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Your Posts
                </h2>
                <Button type="button" disabled={loading || busy} onClick={loadPosts}>
                  Refresh
                </Button>
              </div>

              {loading ? (
                <div className="mt-5 flex flex-col gap-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm font-semibold text-slate-500 dark:border-blue-400/20 dark:text-blue-100/50">
                  No posts yet. Write your first one!
                </div>
              ) : (
                <div className="mt-5 grid gap-3">
                  {posts.map((post) => (
                    <div
                      key={post._id}
                      className="rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-blue-400/20 dark:bg-blue-950/30"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/blogs/${post.slug}`}
                            className="block truncate text-sm font-extrabold text-slate-900 hover:text-blue-700 dark:text-white dark:hover:text-blue-300"
                          >
                            {post.title}
                          </Link>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusBadge(post.status)}`}>
                              {post.status}
                            </span>
                            {post.category && (
                              <span className="text-[10px] text-slate-400">{post.category.replace(/_/g, " ")}</span>
                            )}
                            {post.flair && (
                              <span className="text-[10px] font-semibold text-blue-500">{post.flair.replace(/_/g, " ")}</span>
                            )}
                            <span className="ml-auto text-[10px] text-slate-400">{formatDate(post.publishedAt || post.createdAt)}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => deletePost(post.slug)}
                          className="shrink-0 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-extrabold text-red-700 transition hover:bg-red-100 disabled:opacity-60 dark:border-red-400/30 dark:bg-red-500/15 dark:text-red-200"
                        >
                          Delete
                        </button>
                      </div>
                      {post.excerpt && (
                        <p className="mt-2 text-xs text-slate-500 line-clamp-2 dark:text-blue-100/50">
                          {post.excerpt}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </Container>
  );
}