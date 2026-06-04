"use client";

import { useState } from "react";

export default function SavePostButton({ postId, slug }) { // add postId prop
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const toggleSave = async () => {
    if (!postId) return; // use postId not slug

    setBusy(true);
    setMessage("");

    const res = await fetch("/api/auth/me/saved-posts", { // ✅ correct route
      method: saved ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" }, // ✅ required
      body: JSON.stringify({ postId }),                 // ✅ send postId
    });

    const data = await res.json().catch(() => null);
    setBusy(false);

    if (data?.ok) {
      setSaved((v) => !v);
      setMessage(saved ? "Removed from saved." : "Saved to your bookmarks!");
      return;
    }

    setMessage(data?.error || "Login required to save posts.");
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={toggleSave}
        disabled={busy}
        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-extrabold text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100 dark:hover:bg-blue-950/45"
      >
        {busy ? "Saving..." : saved ? "✓ Saved" : "Save Blog"}
      </button>
      {message && (
        <p className="text-xs font-semibold text-slate-500 dark:text-blue-100/60">
          {message}
        </p>
      )}
    </div>
  );
}