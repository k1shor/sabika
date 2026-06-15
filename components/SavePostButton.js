"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SavePostButton({ postId }) {
  const [saved, setSaved]     = useState(false);
  const [busy, setBusy]       = useState(false);
  const [checked, setChecked] = useState(false); // has initial check loaded?
  const router = useRouter();

  // check on mount if already saved
  useEffect(() => {
    if (!postId) return;
    fetch("/api/auth/me/saved-posts")
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok) {
          const isSaved = (d.posts || []).some(
            (p) => String(p.postId?._id || p.postId) === String(postId)
          );
          setSaved(isSaved);
        }
      })
      .catch(() => null)
      .finally(() => setChecked(true));
  }, [postId]);

  const toggleSave = async () => {
    if (!postId) return;
    setBusy(true);

    const res = await fetch("/api/auth/me/saved-posts", {
      method:  saved ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ postId }),
    });

    const data = await res.json().catch(() => null);
    setBusy(false);

    // not logged in — redirect to login
    if (res.status === 401) {
      router.push("/login?next=" + window.location.pathname);
      return;
    }

    if (data?.ok) {
      setSaved((v) => !v);
    }
  };

  if (!checked) {
    return (
      <div className="h-9 w-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleSave}
      disabled={busy}
      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-extrabold transition disabled:cursor-not-allowed disabled:opacity-60
        ${saved
          ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-400/30 dark:bg-red-950/20 dark:text-red-400"
          : "border-slate-200 bg-white/80 text-slate-700 hover:bg-white dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100"
        }`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
      {busy ? "..." : saved ? "Saved" : "Save Blog"}
    </button>
  );
}