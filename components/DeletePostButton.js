"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeletePostButton({ slug }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Permanently delete this post? This cannot be undone.")) return;
    setBusy(true);
    try {
      const res  = await fetch(`/api/blogs/${slug}`, { method: "DELETE" });
      const data = await res.json().catch(() => null);
      if (data?.ok) {
        router.push("/writers/posts");
        router.refresh();
      } else {
        alert(data?.error || "Failed to delete post.");
      }
    } catch {
      alert("Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={busy}
      className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-extrabold text-red-700 transition hover:bg-red-100 disabled:opacity-60 dark:border-red-400/30 dark:bg-red-950/20 dark:text-red-400"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
        <path d="M10 11v6"/><path d="M14 11v6"/>
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
      </svg>
      {busy ? "Deleting..." : "Delete"}
    </button>
  );
}