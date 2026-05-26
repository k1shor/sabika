"use client";

import { useState } from "react";

export default function FollowWriterButton({ writerId }) {
  const [following, setFollowing] = useState(false);
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
      setFollowing((value) => !value);
      setMessage(following ? "Writer unfollowed." : "Writer followed.");
      return;
    }

    setMessage(data?.error || "Login required to follow writers.");
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={toggleFollow}
        disabled={busy}
        className="inline-flex items-center justify-center rounded-xl bg-blue-700 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? "Saving..." : following ? "Following" : "Follow Writer"}
      </button>

      {message ? (
        <p className="text-xs font-semibold text-slate-500 dark:text-blue-100/60">
          {message}
        </p>
      ) : null}
    </div>
  );
}