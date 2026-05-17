"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import TextArea from "@/components/TextArea";
import RichTextEditor from "@/components/RichTextEditor";

async function uploadFile(file) {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: form,
  });

  const data = await res.json().catch(() => null);
  if (!data?.ok) return null;
  return data.url;
}

export default function AdminPostsPanel() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const [coverImage, setCoverImage] = useState("");
  const [contentHtml, setContentHtml] = useState("");

  const coverRef = useRef(null);
  const inlineRef = useRef(null);

  const load = async () => {
    setLoading(true);
    setMsg(null);

    const res = await fetch("/api/admin/posts", { cache: "no-store" });
    const data = await res.json().catch(() => null);

    setLoading(false);

    if (!data?.ok) {
      setMsg(data?.error || "Failed to load posts");
      setPosts([]);
      return;
    }

    setPosts(Array.isArray(data.posts) ? data.posts : []);
  };

  useEffect(() => {
    // Initial data sync from the admin API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const pickCover = () => coverRef.current?.click();
  const pickInline = () => inlineRef.current?.click();

  const onCoverChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setBusy(true);
    setMsg(null);

    const url = await uploadFile(file);

    setBusy(false);

    if (!url) {
      setMsg("Cover upload failed. Check Cloudinary env vars and try again.");
      return;
    }

    setCoverImage(url);
  };

  const onUploadInline = async () => {
    return new Promise((resolve) => {
      const el = inlineRef.current;
      if (!el) return resolve(null);

      const handler = async () => {
        const file = el.files?.[0];
        el.value = "";
        el.removeEventListener("change", handler);

        if (!file) return resolve(null);

        setBusy(true);
        setMsg(null);

        const url = await uploadFile(file);

        setBusy(false);

        if (!url) {
          setMsg("Image upload failed. Check Cloudinary env vars.");
          return resolve(null);
        }

        resolve(url);
      };

      el.addEventListener("change", handler);
      el.click();
    });
  };

  const createPost = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);

    const form = new FormData(e.target);

    const payload = {
      title: String(form.get("title") || ""),
      excerpt: String(form.get("excerpt") || ""),
      tags: String(form.get("tags") || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      author: String(form.get("author") || "Nursing Nepal"),
      readTime: String(form.get("readTime") || "5 min read"),
      images: [],
    };

    if (coverImage) payload.coverImage = coverImage;
    if (contentHtml) payload.contentHtml = contentHtml;

    const res = await fetch("/api/admin/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);
    setBusy(false);

    if (!data?.ok) {
      setMsg(data?.error || "Failed to create post");
      return;
    }

    e.target.reset();
    setCoverImage("");
    setContentHtml("");
    await load();
    setMsg("Article created successfully.");
  };

  const deletePost = async (id) => {
    if (!confirm("Delete this post?")) return;

    setBusy(true);
    setMsg(null);

    const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => null);

    setBusy(false);

    if (!data?.ok) {
      setMsg(data?.error || "Failed to delete");
      return;
    }

    await load();
    setMsg("Article deleted.");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Create New Article
        </h2>

        <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={onCoverChange} />
        <input ref={inlineRef} type="file" accept="image/*" className="hidden" />

        <form onSubmit={createPost} className="mt-5 grid gap-4">
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
              Title
            </label>
            <div className="mt-2">
              <Input name="title" placeholder="Article title..." required />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
              Excerpt
            </label>
            <div className="mt-2">
              <TextArea name="excerpt" placeholder="Short summary..." required />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
                Tags (comma separated)
              </label>
              <div className="mt-2">
                <Input name="tags" placeholder="home-care, patient-care" />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
                Read Time
              </label>
              <div className="mt-2">
                <Input name="readTime" placeholder="5 min read" defaultValue="5 min read" />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
              Author
            </label>
            <div className="mt-2">
              <Input name="author" placeholder="Nursing Nepal" defaultValue="Nursing Nepal" />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white/70 p-5 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Cover Image
                </div>
                <div className="mt-1 text-xs font-semibold text-slate-600 dark:text-blue-100/70">
                  Upload a banner/cover image for this blog.
                </div>
              </div>

              <Button type="button" disabled={busy} onClick={pickCover}>
                {busy ? "Uploading..." : "Upload Cover"}
              </Button>
            </div>

            {coverImage ? (
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 dark:border-blue-400/20">
                <img src={coverImage} alt="Cover" className="h-44 w-full object-cover" />
              </div>
            ) : null}
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                Content (Rich Text)
              </div>

              <button
                type="button"
                onClick={pickInline}
                className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm font-extrabold text-slate-800 hover:bg-white transition
                dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100 dark:hover:bg-blue-950/45"
              >
                Choose Image
              </button>
            </div>

            <div className="mt-2">
              <RichTextEditor
                value={contentHtml}
                onChange={setContentHtml}
                onUploadImage={onUploadInline}
              />
            </div>
          </div>

          {msg && (
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100/80">
              {msg}
            </div>
          )}

          <Button type="submit" disabled={busy}>
            {busy ? "Saving..." : "Create Article"}
          </Button>
        </form>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Articles
          </h2>
          <Button type="button" disabled={loading || busy} onClick={load}>
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="mt-5 text-sm font-semibold text-slate-600 dark:text-blue-100/70">
            Loading...
          </div>
        ) : posts.length === 0 ? (
          <div className="mt-5 text-sm font-semibold text-slate-600 dark:text-blue-100/70">
            No posts found.
          </div>
        ) : (
          <div className="mt-5 grid gap-3">
            {posts.map((p) => (
              <div
                key={p._id}
                className="rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-blue-400/20 dark:bg-blue-950/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                      {p.title}
                    </div>
                    <div className="mt-1 text-xs font-semibold text-slate-600 dark:text-blue-100/70 truncate">
                      /blogs/{p.slug}
                    </div>
                  </div>

                  <button
                    disabled={busy}
                    onClick={() => deletePost(p._id)}
                    className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-extrabold text-red-700 hover:bg-red-100 transition
                    disabled:opacity-60 disabled:cursor-not-allowed
                    dark:border-red-400/30 dark:bg-red-500/15 dark:text-red-200 dark:hover:bg-red-500/25"
                  >
                    Delete
                  </button>
                </div>

                {p.coverImage ? (
                  <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 dark:border-blue-400/20">
                    <img src={p.coverImage} alt="" className="h-28 w-full object-cover" />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
