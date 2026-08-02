"use client";

import { useRef, useState } from "react";
import PostFormFields from "@/components/posts/PostFormFields";
import { uploadFile, normalizeFieldErrors } from "@/components/posts/postFormUtils";
import { createPost as createPostRequest } from "../services/postService";

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

// onResult receives { ok, message, refresh } -- refresh tells the
// parent whether to reload the post list. Field-level validation
// errors stay local to this form and never reach the parent, matching
// the original behavior (only success or a general/non-field error
// triggers the shared page banner + list reload).
export default function CreatePostForm({ onResult }) {
  const [busy,         setBusy]        = useState(false);
  const [fieldErrors,  setFieldErrors] = useState({});
  const [fields, setFieldsRaw] = useState(EMPTY_FIELDS);
  const setFields = (partial) => setFieldsRaw((prev) => ({ ...prev, ...partial }));

  const formRef   = useRef(null);
  const coverRef  = useRef(null);
  const inlineRef = useRef(null);

  const handleUploadCover = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadFile(file);
      setFields({ coverImage: url });
    } catch (err) {
      onResult({ ok: false, message: err.message || "Cover image upload failed.", refresh: false });
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
        catch (err) { onResult({ ok: false, message: err.message || "Image upload failed.", refresh: false }); resolve(null); }
        finally { setBusy(false); }
      };
      input.addEventListener("change", handler);
      input.click();
    });

  // Takes an explicit boolean instead of trying to infer which button
  // was clicked from the submit event -- e.nativeEvent.submitter is
  // not reliably supported/behaved the same across every browser.
  const createPost = async (saveAsDraft) => {
    const formEl = formRef.current;
    if (!formEl) return;

    setFieldErrors({});

    const form     = new FormData(formEl);
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
      saveAsDraft,
      images:      [],
    };

    try {
      const data = await createPostRequest(payload);

      if (!data?.ok) {
        const normalized = normalizeFieldErrors(data?.fields || data?.fieldErrors);
        setFieldErrors(normalized);
        if (Object.keys(normalized).length === 0) {
          onResult({ ok: false, message: data?.error || "Post creation failed.", refresh: false });
        }
        return;
      }

      formEl.reset();
      setFieldsRaw(EMPTY_FIELDS);
      onResult({
        ok: true,
        message: data.message || (saveAsDraft ? "Post saved as draft!" : "Post submitted! It will be published shortly."),
        refresh: true,
      });
    } catch {
      onResult({ ok: false, message: "Something went wrong. Try again.", refresh: false });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-w-0 rounded-3xl border border-slate-200 bg-white/70 p-5 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25 sm:p-6">
      <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
        Create Post
      </h2>

      <form ref={formRef} onSubmit={(e) => e.preventDefault()} className="mt-5">
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
          <div className="flex flex-col gap-2 xs:flex-row sm:flex-row">
            <button
              type="button"
              disabled={busy}
              onClick={() => createPost(true)}
              className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-blue-400/20 dark:bg-blue-950/20 dark:text-blue-100 sm:py-2.5"
            >
              {busy ? "Saving..." : "Save as Draft"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => createPost(false)}
              className="flex-1 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60 sm:py-2.5"
            >
              {busy ? "Publishing..." : "Publish Post"}
            </button>
          </div>
        </PostFormFields>
      </form>
    </div>
  );
}