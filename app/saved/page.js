"use client";

import { useEffect, useState } from "react";
import Container from "@/components/Container";
import SavedPostList from "@/components/saved/SavedPostList";
import SavedPostsHeader from "@/components/saved/SavedPostsHeader";
import { SavedPostsEmpty, SavedPostsLoading, SavedPostsMessage } from "@/components/saved/SavedPostsState";

export default function SavedPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/auth/me/saved-posts", { cache: "no-store" });
    const data = await res.json().catch(() => null);

    setLoading(false);

    if (!data?.ok) {
      setMessage(data?.error || "Login required to view saved posts.");
      setPosts([]);
      return;
    }

    setPosts(Array.isArray(data.posts) ? data.posts : []);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  return (
    <Container>
      <div className="rounded-3xl border border-slate-200 bg-white/70 p-7 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
        <SavedPostsHeader loading={loading} onRefresh={load} />

        {loading ? (
          <SavedPostsLoading />
        ) : message ? (
          <SavedPostsMessage>{message}</SavedPostsMessage>
        ) : posts.length === 0 ? (
          <SavedPostsEmpty />
        ) : (
          <SavedPostList posts={posts} />
        )}
      </div>
    </Container>
  );
}
