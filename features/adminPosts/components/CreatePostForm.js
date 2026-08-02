"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import Button    from "@/components/Button";
import Input     from "@/components/Input";
import TextArea  from "@/components/TextArea";
import RichTextEditor from "@/components/RichTextEditor";
import {
  CATEGORY_OPTIONS,
  POST_TYPE_OPTIONS,
  uploadFile,
  selectClass,
} from "@/components/posts/postFormUtils";
import { createAdminPost } from "../services/postService";

export default function CreatePostForm({ onCreated }) {
  const [busy,        setBusy]        = useState(false);
  const [coverImage,  setCoverImage]  = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [msg,         setMsg]         = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const coverRef  = useRef(null);
  const inlineRef = useRef(null);

  // ── upload helpers ───────────────────────────────────
  const uploadCover = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      setCoverImage(await uploadFile(file));
    } catch (err) {
      setMsg({ text: err.message, ok: false });
    } finally {
      setBusy(false);
    }
  };

  const uploadInlineImage = () =>
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

  // ── submit ───────────────────────────────────────────
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

    const errors = {};
    if (!title)    errors.title    = "Title is required";
    if (!excerpt)  errors.excerpt  = "Excerpt is required";
    if (!category) errors.category = "Category is required";
    if (!contentHtml || contentHtml.trim() === "" || contentHtml === "<p></p>")
                   errors.content  = "Content is required";

    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }

    setBusy(true);
    try {
      const data = await createAdminPost({
        title, excerpt, category, postType, readTime,
        coverImage,
        contentHtml,
      });

      if (!data?.ok) {
        setMsg({ text: data?.error || "Failed to create post.", ok: false });
        if (data?.fields) setFieldErrors(data.fields);
        return;
      }

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

  // ── render ───────────────────────────────────────────
  return (
    <div className="rounded-3xl border border-blue-200 bg-blue-50/40 p-6 dark:border-blue-400/20 dark:bg-blue-950/20">

      {/* heading */}
      <div className="mb-5 flex items-center gap-3">
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

      {/* hidden file inputs */}
      <input ref={coverRef}  type="file" accept="image/*" className="hidden" onChange={uploadCover} />
      <input ref={inlineRef} type="file" accept="image/*" className="hidden" />

      <form onSubmit={handleSubmit} className="grid gap-4">

        {/* Title */}
        <div>
          <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
            Title <span className="text-red-500">*</span>
          </label>
          <div className="mt-1.5">
            <Input name="title" placeholder="Post title" hasError={!!fieldErrors.title} />
            {fieldErrors.title && <p className="mt-1 text-xs text-red-600">{fieldErrors.title}</p>}
          </div>
        </div>

        {/* Excerpt */}
        <div>
          <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
            Excerpt <span className="text-red-500">*</span>
          </label>
          <div className="mt-1.5">
            <TextArea name="excerpt" placeholder="Short description shown in blog cards" hasError={!!fieldErrors.excerpt} />
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
                {CATEGORY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              {fieldErrors.category && <p className="mt-1 text-xs text-red-600">{fieldErrors.category}</p>}
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">Post Type</label>
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
        <div className="rounded-2xl border border-slate-200 bg-white/60 p-4 dark:border-blue-400/20 dark:bg-blue-950/40">
          <div className="flex items-center gap-4">
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
            <img src={coverImage} alt="Cover" className="mt-4 h-36 w-full rounded-2xl object-cover" />
          )}
        </div>

        {/* Rich Text Content */}
        <div className="min-w-0">
          <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
            Content <span className="text-red-500">*</span>
          </label>
          <div className="mt-1.5 min-w-0 overflow-hidden">
            <RichTextEditor
              value={contentHtml}
              onChange={setContentHtml}
              onUploadImage={uploadInlineImage}
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