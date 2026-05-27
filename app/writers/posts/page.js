"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Container from "@/components/Container";
import Button from "@/components/Button";
import Input from "@/components/Input";
import TextArea from "@/components/TextArea";
import RichTextEditor from "@/components/RichTextEditor";

async function uploadFile(file) {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch("/api/upload", { method: "POST", body: form });
  const data = await res.json().catch(() => null);
  return data?.ok ? data.url : null;
}

export default function WriterPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [accessError, setAccessError] = useState(null);
  const [coverImage, setCoverImage] = useState("");
  const [contentHtml, setContentHtml] = useState("");

  const coverRef = useRef(null);
  const inlineRef = useRef(null);

  const loadPosts = async () => {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/writers/posts", { cache: "no-store" });
    const data = await res.json().catch(() => null);

    setLoading(false);

    if (!data?.ok) {
      setAccessError(data?.error || "Unable to load your posts.");
      setPosts([]);
      return;
    }

    setAccessError(null);
    setPosts(Array.isArray(data.posts) ? data.posts : []);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPosts();
  }, []);

  const uploadCover = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setBusy(true);
    setError(null);

    const url = await uploadFile(file);
    setBusy(false);

    if (!url) {
      setError("Cover image upload failed.");
      return;
    }

    setCoverImage(url);
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
        setError(null);

        const url = await uploadFile(file);
        setBusy(false);

        if (!url) {
          setError("Content image upload failed.");
          return resolve(null);
        }

        resolve(url);
      };

      input.addEventListener("change", handler);
      input.click();
    });
  };

  const createPost = async (event) => {
    event.preventDefault();
  
    const formElement = event.currentTarget;
  
    setBusy(true);
    setMessage(null);
    setError(null);
  
    const form = new FormData(formElement);
  
    const payload = {
      title: String(form.get("title") || ""),
      slug: String(form.get("slug") || ""),
      excerpt: String(form.get("excerpt") || ""),
      coverImage,
      contentHtml,
      tags: String(form.get("tags") || "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      readTime: String(form.get("readTime") || "5 min read"),
      images: [],
    };
  
    const res = await fetch("/api/writers/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  
    const data = await res.json().catch(() => null);
  
    setBusy(false);
  
    if (!data?.ok) {
      setError(data?.error || "Post creation failed.");
      return;
    }
  
    formElement.reset();
  
    setCoverImage("");
    setContentHtml("");
    setMessage("Post published. Followers will get a notification.");
  
    await loadPosts();
  };

  const deletePost = async (id) => {
    if (!confirm("Delete this post from your writer account?")) return;

    setBusy(true);
    setMessage(null);
    setError(null);

    const res = await fetch(`/api/writers/posts/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => null);

    setBusy(false);

    if (!data?.ok) {
      setError(data?.error || "Delete failed.");
      return;
    }

    setMessage("Post deleted.");
    await loadPosts();
  };

  return (
    <Container>
      <div className="grid gap-6">
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
              Approved writers can publish posts. Admins can still moderate and delete any unsafe post.
            </p>
          </div>
          <Link href="/apply-writer" className="text-sm font-extrabold text-blue-700 hover:text-blue-600 dark:text-blue-300">
            Writer application
          </Link>
        </div>

        {(message || error || accessError) && (
          <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
            error || accessError
              ? "border-red-200 bg-red-50 text-red-700 dark:border-red-400/30 dark:bg-red-500/15 dark:text-red-200"
              : "border-slate-200 bg-white/80 text-slate-700 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100/80"
          }`}>
            {accessError || error || message}
          </div>
        )}

        {accessError ? (
          <div className="rounded-3xl border border-slate-200 bg-white/70 p-7 text-sm font-semibold text-slate-600 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25 dark:text-blue-100/70">
            Login as an approved blog writer to create posts. If your writer approval is still pending, wait for admin review.
          </div>
        ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Create Post
            </h2>

            <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={uploadCover} />
            <input ref={inlineRef} type="file" accept="image/*" className="hidden" />

            <form onSubmit={createPost} className="mt-5 grid gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">Title</label>
                <div className="mt-2">
                  <Input name="title" placeholder="Article title" required />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">Custom slug</label>
                <div className="mt-2">
                  <Input name="slug" placeholder="optional-blog-url-slug" />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">Excerpt</label>
                <div className="mt-2">
                  <TextArea name="excerpt" placeholder="Short post summary" required />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">Tags</label>
                  <div className="mt-2">
                    <Input name="tags" placeholder="nursing, nepal" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">Read time</label>
                  <div className="mt-2">
                    <Input name="readTime" defaultValue="5 min read" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-blue-400/20 dark:bg-blue-950/25">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm font-extrabold text-slate-900 dark:text-white">Cover Image</div>
                    <div className="mt-1 text-xs font-semibold text-slate-500 dark:text-blue-100/60">
                      Optional, but it makes the blog card look better.
                    </div>
                  </div>
                  <Button type="button" disabled={busy} onClick={() => coverRef.current?.click()}>
                    {busy ? "Uploading..." : "Upload Cover"}
                  </Button>
                </div>
                {coverImage ? (
                  <img src={coverImage} alt="Cover preview" className="mt-4 h-40 w-full rounded-2xl object-cover" />
                ) : null}
              </div>

              <RichTextEditor value={contentHtml} onChange={setContentHtml} onUploadImage={uploadInlineImage} />

              <Button type="submit" disabled={busy}>
                {busy ? "Publishing..." : "Publish Post"}
              </Button>
            </form>
          </div>

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
              <div className="mt-5 text-sm font-semibold text-slate-600 dark:text-blue-100/70">Loading posts...</div>
            ) : posts.length === 0 ? (
              <div className="mt-5 text-sm font-semibold text-slate-600 dark:text-blue-100/70">
                No posts yet.
              </div>
            ) : (
              <div className="mt-5 grid gap-3">
                {posts.map((post) => (
                  <div key={post._id} className="rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-blue-400/20 dark:bg-blue-950/30">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link href={`/blogs/${post.slug}`} className="block truncate text-sm font-extrabold text-slate-900 hover:text-blue-700 dark:text-white dark:hover:text-blue-300">
                          {post.title}
                        </Link>
                        <div className="mt-1 truncate text-xs font-semibold text-slate-500 dark:text-blue-100/55">
                          /blogs/{post.slug}
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => deletePost(post._id)}
                        className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-extrabold text-red-700 transition hover:bg-red-100 disabled:opacity-60 dark:border-red-400/30 dark:bg-red-500/15 dark:text-red-200"
                      >
                        Delete
                      </button>
                    </div>
                    {post.excerpt ? (
                      <p className="mt-3 text-sm text-slate-600 dark:text-blue-100/70">{post.excerpt}</p>
                    ) : null}
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
