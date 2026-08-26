"use client";

import { useEffect, useState } from "react";
import FollowingHeader from "@/components/following/FollowingHeader";
import FollowingMessage from "@/components/following/FollowingMessage";
import FollowingStateCard from "@/components/following/FollowingStateCard";
import WritersGrid from "@/components/following/WritersGrid";

export default function FollowingPanel() {
  const [writers, setWriters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [loadError, setLoadError] = useState(false);

  const load = async () => {
    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/auth/me/following", { cache: "no-store" });
    const data = await res.json().catch(() => null);

    setLoading(false);

    if (!data?.ok) {
      setMessage(data?.error || "Unable to load followed writers.");
      setLoadError(true);
      setWriters([]);
      return;
    }

    setLoadError(false);
    setWriters(Array.isArray(data.writers) ? data.writers : []);
  };

  useEffect(() => {
    load();
  }, []);

  const unfollow = async (writerId) => {
    const res = await fetch("/api/auth/me/following", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ writerId }),
    });
    const data = await res.json().catch(() => null);

    if (!data?.ok) {
      setMessage(data?.error || "Unable to unfollow writer.");
      return;
    }

    setWriters((list) => list.filter((writer) => writer._id !== writerId));
    setMessage("Writer removed from your following list.");
  };

  return (
    <div className="grid gap-6">
      <FollowingHeader loading={loading} onRefresh={load} />
      <FollowingMessage>{message}</FollowingMessage>

      {loading ? (
        <FollowingStateCard>Loading followed writers...</FollowingStateCard>
      ) : loadError ? null : writers.length === 0 ? (
        <FollowingStateCard>
          You are not following any writer yet. Open a writer profile from a blog post and press Follow.
        </FollowingStateCard>
      ) : (
        <WritersGrid writers={writers} onUnfollow={unfollow} />
      )}
    </div>
  );
}
