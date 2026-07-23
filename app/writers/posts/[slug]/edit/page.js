"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter }  from "next/navigation";
import Link                      from "next/link";
import Container                 from "@/components/Container";
import Button                    from "@/components/Button";
import PostFormFields             from "@/components/posts/PostFormFields";
import { uploadFile }            from "@/components/posts/postFormUtils";

// ─────────────────────────────────────────────────────────
export default function EditPostPage() {
  const { slug } = useParams();
  const router   = useRouter();

  const coverRef  = useRef(null);
  const inlineRef = useRef(null);

  const [post,        setPost]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [busy,        setBusy]        = useState(false);
  const [msg,         setMsg]         = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // all form fields in one object, mirrors PostFormFields expectations
  const [fields, setFieldsRaw] = useState({
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
  });
  const setFields = (partial) => setFieldsRaw((prev) => ({ ...prev, ...partial }));

  // ── load post ─────────────────────────────────────────
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/blogs/${slug}?edit=true`)
      .then((r) => r.json())
      .then((d) => {
        if (!d?.ok || !d?.post) {
          setMsg({ text: "Post not found or you don't have permission.", ok: false });
          return;
        }
        const p = d.post;
        setPost(p);
        setFieldsRaw({
          title:       p.title        || "",
          excerpt:     p.excerpt      || "",
          category:    p.category     || "",
          postType:    p.postType     || "normal",
          flair:       p.flair        || "",
          tags:        (p.tags || []).join(", "),
          readTime:    p.readTime     || "5 min read",
          coverImage:  p.coverImage   || "",
          isAnonymous: p.isAnonymous  || false,
          contentHtml: p.contentHtml  || "",
        });
      })
      .catch(() => setMsg({ text: "Failed to load post.", ok: false }))
      .finally(() => setLoading(false));
  }, [slug]);

  // ── upload helpers ────────────────────────────────────
  const handleUploadCover = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadFile(file);
      setFields({ coverImage: url });
    } catch (err) {
      setMsg({ text: err.message, ok: false });
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
        catch (err) { setMsg({ text: err.message, ok: false }); resolve(null); }
        finally { setBusy(false); }
      };
      input.addEventListener("change", handler);
      input.click();
    });

  // ── save ──────────────────────────────────────────────
  // `publish: true` is only sent when the Publish button is used --
  // plain "Save Changes" leaves status untouched (a draft stays a
  // draft, an already-live post goes back to pending for re-review).
  const handleSave = async (publish = false) => {
    setMsg(null);
    setFieldErrors({});

    const errors = {};
    if (!fields.title.trim())       errors.title       = ["Title is required"];
    if (!fields.excerpt.trim())     errors.excerpt     = ["Excerpt is required"];
    if (!fields.category)           errors.category    = ["Category is required"];
    if (!fields.contentHtml.trim() || fields.contentHtml === "<p></p>")
                                    errors.contentHtml = ["Content is required"];

    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }

    setBusy(true);
    try {
      const parsedTags = fields.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 5);

      const res  = await fetch(`/api/blogs/${slug}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          title:       fields.title.trim(),
          excerpt:     fields.excerpt.trim(),
          contentHtml: fields.contentHtml.trim(),
          category:    fields.category,
          postType:    fields.postType,
          flair:       fields.flair,
          tags:        parsedTags,
          readTime:    fields.readTime.trim() || "5 min read",
          coverImage:  fields.coverImage,
          isAnonymous: fields.isAnonymous,
          publish,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!data?.ok) { setMsg({ text: data?.error || "Failed to save.", ok: false }); return; }

      setMsg({ text: data.message || "Post updated successfully!", ok: true });
      setTimeout(() => router.push("/writers/posts"), 2000);
    } catch {
      setMsg({ text: "Something went wrong. Try again.", ok: false });
    } finally {
      setBusy(false);
    }
  };

  // ── states ────────────────────────────────────────────
  if (loading) return (
    <Container>
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
      </div>
    </Container>
  );

  if (!post && msg) return (
    <Container>
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-400/20 dark:bg-red-950/20">
        <p className="text-sm font-semibold text-red-700 dark:text-red-300">{msg.text}</p>
        <Link href="/writers/posts" className="mt-4 inline-block text-sm font-bold text-blue-600 hover:underline">
          ← Back to My Posts
        </Link>
      </div>
    </Container>
  );

  const isDraft = post?.status === "draft";

  // ── render ────────────────────────────────────────────
  return (
    <Container>
      <div className="grid gap-6">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
          <div>
            <Link
              href="/writers/posts"
              className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:text-blue-100/40 dark:hover:text-blue-100/70"
            >
              ← Back to My Posts
            </Link>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Edit Post
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-blue-100/50">
              {isDraft
                ? "This post is a draft and is not visible to anyone yet."
                : "After saving, your post will go back for admin review before showing publicly."}
            </p>
          </div>
          {post?.status && (
            <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold ${
              post.status === "approved" ? "border-green-200 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-950/20 dark:text-green-400"
              : post.status === "pending" ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-950/20 dark:text-amber-400"
              : "border-slate-200 bg-slate-50 text-slate-500"
            }`}>
              Current: {post.status}
            </span>
          )}
        </div>

        {/* Form */}
        <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
          <PostFormFields
            mode="edit"
            fields={fields}
            setFields={setFields}
            fieldErrors={fieldErrors}
            busy={busy}
            coverRef={coverRef}
            inlineRef={inlineRef}
            onUploadCover={handleUploadCover}
            onUploadInlineImage={handleUploadInlineImage}
          >
            {/* Warning */}
            {!isDraft && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 px-4 py-3 dark:border-amber-400/20 dark:bg-amber-950/20">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                  ⚠️ Saving will send your post back for admin review. It will be temporarily hidden until re-approved.
                </p>
              </div>
            )}

            {/* Success / error message */}
            {msg && (
              <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
                msg.ok
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/20 dark:text-emerald-300"
                  : "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-950/20 dark:text-red-300"
              }`}>
                {msg.text}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/writers/posts"
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-blue-400/20 dark:bg-blue-950/20 dark:text-blue-100"
              >
                Cancel
              </Link>
              <Button
                type="button"
                onClick={() => handleSave(false)}
                disabled={busy}
                className="flex-1"
              >
                {busy ? "Saving..." : "Save Changes"}
              </Button>
              {isDraft && (
                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  disabled={busy}
                  className="flex-1 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
                >
                  {busy ? "Publishing..." : "Publish"}
                </button>
              )}
            </div>
          </PostFormFields>
        </div>

      </div>
    </Container>
  );
}