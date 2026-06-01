"use client";

import { useState } from "react";

export default function FollowWriterButton({ writerId, initialFollowing = false, initialFollowerCount = 0 }) {
  const [following, setFollowing] = useState(initialFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const toggleFollow = async () => {
    if (!writerId) return;

    setBusy(true);
    setMessage("");

    const res = await fetch(`/api/writers/${writerId}/follow`, {
      method: following ? "DELETE" : "POST",
    });

    const data = await res.json().catch(() => null);

    setBusy(false);

    if (data?.ok) {
      setFollowing(Boolean(data.following));
      setFollowerCount(Number(data.followerCount) || 0);
      setMessage(data.message || (data.following ? "Writer followed." : "Writer unfollowed."));
      return;
    }

    setMessage(data?.error || "Login required to follow writers.");
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {following ? (
          <span className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-extrabold text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/15 dark:text-emerald-200">
            Following
          </span>
        ) : null}
        <button
          type="button"
          onClick={toggleFollow}
          disabled={busy}
          className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-extrabold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
            following ? "bg-red-600 hover:bg-red-500" : "bg-blue-700 hover:bg-blue-600"
          }`}
        >
          {busy ? "Saving..." : following ? "Unfollow" : "Follow Writer"}
        </button>
      </div>

      <p className="text-xs font-bold text-slate-500 dark:text-blue-100/60">
        {followerCount} follower{followerCount === 1 ? "" : "s"}
      </p>

      {message ? (
        <p className="text-xs font-semibold text-slate-500 dark:text-blue-100/60">
          {message}
        </p>
      ) : null}
    </div>
  );
}
