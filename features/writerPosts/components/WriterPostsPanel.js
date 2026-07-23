"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/Container";
import CreatePostForm from "./CreatePostForm";
import PostsList from "./PostsList";
import { fetchMyPosts } from "../services/postService";

export default function WriterPostsPanel() {
  const router = useRouter();

  const [posts,         setPosts]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [message,       setMessage]       = useState(null);
  const [error,         setError]         = useState(null);
  const [followerCount, setFollowerCount] = useState(0);

  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    const data = await fetchMyPosts();

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

  useEffect(() => { loadPosts(); }, []); // eslint-disable-line

  // Shared by both CreatePostForm and PostsList -- matches the shape
  // { ok, message, refresh } so one handler covers create/publish/delete.
  const handleResult = ({ ok, message, refresh }) => {
    setMessage(null);
    setError(null);
    if (ok) setMessage(message);
    else setError(message);
    if (refresh) loadPosts();
  };

  if (loading) return (
    <Container>
      <div className="grid gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800" />
        ))}
      </div>
    </Container>
  );

  return (
    <Container>
      <div className="grid gap-4 overflow-hidden sm:gap-6">

        {/* Header */}
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

        {/* Global messages */}
        {(message || error) && (
          <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
            error
              ? "border-red-200 bg-red-50 text-red-700 dark:border-red-400/30 dark:bg-red-500/15 dark:text-red-200"
              : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/15 dark:text-emerald-200"
          }`}>
            {error || message}
          </div>
        )}

        {/* Two-column layout */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
          <CreatePostForm onResult={handleResult} />
          <PostsList posts={posts} loading={loading} onResult={handleResult} onRefresh={loadPosts} />
        </div>
      </div>
    </Container>
  );
}