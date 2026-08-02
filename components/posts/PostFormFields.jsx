"use client";

// ─────────────────────────────────────────────────────────
// PostFormFields.jsx
// All shared form fields for create + edit post forms.
//
// Props:
//   mode          "create" | "edit"
//   fields        { title, excerpt, category, postType, flair,
//                   tags, readTime, coverImage, isAnonymous, contentHtml }
//   setFields     (partial) => void   — update any subset of fields
//   fieldErrors   { [field]: string[] }
//   busy          boolean
//   coverRef      React ref for the hidden cover <input type="file">
//   inlineRef     React ref for the hidden inline-image <input type="file">
//   onUploadCover (e) => void
//   children      submit / action buttons (placed at the bottom)
// ─────────────────────────────────────────────────────────

/* eslint-disable @next/next/no-img-element */
import Input    from "@/components/Input";
import TextArea from "@/components/TextArea";
import RichTextEditor from "@/components/RichTextEditor";
import Button   from "@/components/Button";
import {
  CATEGORY_OPTIONS,
  POST_TYPE_OPTIONS,
  FLAIR_OPTIONS,
  selectClass,
} from "./postFormUtils";

// ── tiny helper ──────────────────────────────────────────
export function FieldError({ errors, field }) {
  if (!Array.isArray(errors?.[field]) || errors[field].length === 0) return null;
  return (
    <p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-400">
      {errors[field][0]}
    </p>
  );
}

// ────────────────────────────────────────────────────────
export default function PostFormFields({
  mode = "create",
  fields,
  setFields,
  fieldErrors = {},
  busy = false,
  coverRef,
  inlineRef,          // only needed for create (inline image upload)
  onUploadCover,
  onUploadInlineImage, // only needed for create
  children,           // action buttons
}) {
  const {
    title       = "",
    excerpt     = "",
    category    = "",
    postType    = "normal",
    flair       = "",
    tags        = "",
    readTime    = "5 min read",
    coverImage  = "",
    isAnonymous = false,
    contentHtml = "",
  } = fields;

  const set = (key) => (e) => setFields({ [key]: e.target.value });

  return (
    <div className="grid gap-5">

      {/* ── Title ─────────────────────────────────────── */}
      <div>
        <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
          Title <span className="text-red-500">*</span>
        </label>
        <div className="mt-1.5">
          {mode === "create" ? (
            <Input name="title" placeholder="Article title" hasError={!!fieldErrors?.title} />
          ) : (
            <Input
              value={title}
              onChange={set("title")}
              placeholder="Post title"
              hasError={!!fieldErrors?.title}
            />
          )}
          <FieldError errors={fieldErrors} field="title" />
        </div>
      </div>

      {/* ── Custom slug (create only) ──────────────────── */}
      {mode === "create" && (
        <div>
          <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
            Custom slug <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <div className="mt-1.5">
            <Input name="slug" placeholder="leave blank to auto-generate" />
            <FieldError errors={fieldErrors} field="slug" />
          </div>
        </div>
      )}

      {/* ── Excerpt ───────────────────────────────────── */}
      <div>
        <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
          Excerpt <span className="text-red-500">*</span>
        </label>
        <div className="mt-1.5">
          {mode === "create" ? (
            <TextArea
              name="excerpt"
              placeholder="Short summary shown in blog cards"
              hasError={!!fieldErrors?.excerpt}
            />
          ) : (
            <TextArea
              value={excerpt}
              onChange={set("excerpt")}
              placeholder="Short description shown in blog cards"
              hasError={!!fieldErrors?.excerpt}
            />
          )}
          <FieldError errors={fieldErrors} field="excerpt" />
        </div>
      </div>

      {/* ── Category + Post Type ──────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
        <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
  Category <span className="text-red-500">*</span>
</label>

<div className="mt-1.5">
  {mode === "create" ? (
    <select
      name="category"
      className={`${selectClass(!!fieldErrors?.category)} bg-white text-slate-700 dark:bg-blue-950/30 dark:text-blue-100`}
    >
      <option value="" className="bg-white text-slate-700 dark:bg-blue-950 dark:text-blue-100">
        Select category
      </option>

      {CATEGORY_OPTIONS.map((o) => (
        <option
          key={o.value}
          value={o.value}
          className="bg-white text-slate-700 dark:bg-blue-950 dark:text-blue-100"
        >
          {o.label}
        </option>
      ))}
    </select>
            ) : (
              <select
                value={category}
                onChange={set("category")}
                className={selectClass(!!fieldErrors?.category)}
              >
                <option value="">Select category</option>
                {CATEGORY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            )}
            <FieldError errors={fieldErrors} field="category" />
          </div>
        </div>

        <div>
        <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
  Post Type
</label>

<div className="mt-1.5">
  {mode === "create" ? (
    <select
      name="postType"
      className={`${selectClass(false)} bg-white text-slate-700 dark:bg-blue-950/30 dark:text-blue-100`}
    >
      {POST_TYPE_OPTIONS.map((o) => (
        <option
          key={o.value}
          value={o.value}
          className="bg-white text-slate-700 dark:bg-blue-950 dark:text-blue-100"
        >
          {o.label}
        </option>
      ))}
    </select>
            ) : (
              <select
                value={postType}
                onChange={set("postType")}
                className={selectClass(false)}
              >
                {POST_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* ── Flair + Read Time ─────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
        <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
  Flair
</label>

<div className="mt-1.5">
  {mode === "create" ? (
    <select
      name="flair"
      className={`${selectClass(false)} bg-white text-slate-700 dark:bg-blue-950/30 dark:text-blue-100`}
    >
      {FLAIR_OPTIONS.map((f) => (
        <option
          key={f.value}
          value={f.value}
          className="bg-white text-slate-700 dark:bg-blue-950 dark:text-blue-100"
        >
          {f.label}
        </option>
      ))}
    </select>
            ) : (
              <select
                value={flair}
                onChange={set("flair")}
                className={selectClass(false)}
              >
                {FLAIR_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            )}
            <FieldError errors={fieldErrors} field="flair" />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">Read time</label>
          <div className="mt-1.5">
            {mode === "create" ? (
              <Input name="readTime" defaultValue="5 min read" />
            ) : (
              <Input
                value={readTime}
                onChange={set("readTime")}
                placeholder="5 min read"
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Tags ──────────────────────────────────────── */}
      <div>
        <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
          Tags <span className="text-slate-400 font-normal">(comma separated, max 5)</span>
        </label>
        <div className="mt-1.5">
          {mode === "create" ? (
            <Input name="tags" placeholder="NCLEX, ICU, Nepal nurse, salary" />
          ) : (
            <Input
              value={tags}
              onChange={set("tags")}
              placeholder="NCLEX, ICU, Nepal nurse"
            />
          )}
          <FieldError errors={fieldErrors} field="tags" />
        </div>
      </div>

      {/* ── Anonymous toggle ──────────────────────────── */}
      <div
        onClick={() => setFields({ isAnonymous: !isAnonymous })}
        className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition sm:items-center ${
          isAnonymous
            ? "border-blue-300 bg-blue-50 dark:border-blue-400/30 dark:bg-blue-950/20"
            : "border-slate-200 bg-white/60 dark:border-blue-400/20 dark:bg-blue-950/10"
        }`}
      >
        <div
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition sm:mt-0 ${
            isAnonymous ? "border-blue-600 bg-blue-600" : "border-slate-300"
          }`}
        >
          {isAnonymous && (
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
              fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
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

      {/* ── Cover Image ───────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-blue-400/20 dark:bg-blue-950/25">
        <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={onUploadCover} />
        {inlineRef && <input ref={inlineRef} type="file" accept="image/*" className="hidden" />}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-extrabold text-slate-900 dark:text-white">Cover Image</p>
            <p className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-blue-100/60">
              Optional — makes the blog card look much better.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              disabled={busy}
              onClick={() => coverRef.current?.click()}
              className="flex-1 sm:flex-none"
            >
              {busy ? "Uploading..." : coverImage ? "Change" : "Upload Cover"}
            </Button>
            {coverImage && (
              <button
                type="button"
                onClick={() => setFields({ coverImage: "" })}
                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100 dark:border-red-400/30 dark:bg-red-950/20 dark:text-red-400"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {coverImage && (
          <img
            src={coverImage}
            alt="Cover preview"
            className="mt-4 h-40 w-full rounded-2xl object-cover"
          />
        )}
      </div>

      {/* ── Rich Text Editor ──────────────────────────── */}
      <div className="min-w-0">
        <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
          Content <span className="text-red-500">*</span>
        </label>
        <div className="mt-1.5 min-w-0 overflow-hidden">
          <RichTextEditor
            value={contentHtml}
            onChange={(val) => setFields({ contentHtml: val })}
            onUploadImage={onUploadInlineImage}
          />
          <FieldError errors={fieldErrors} field="contentHtml" />
        </div>
      </div>

      {/* ── Field errors summary ──────────────────────── */}
      {Object.keys(fieldErrors).length > 0 && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-400/30 dark:bg-red-500/15 dark:text-red-200">
          Please fix the errors above before publishing.
        </div>
      )}

      {/* ── Slot for action buttons ───────────────────── */}
      {children}
    </div>
  );
}