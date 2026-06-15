"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function FollowWriterButton({ writerId, initialFollowing = false }) {
  const [following, setFollowing] = useState(initialFollowing);
  const [busy, setBusy]           = useState(false);
  const [checked, setChecked]     = useState(false);
  const router = useRouter();

  // check on mount if already following
  useEffect(() => {
    if (!writerId) return;
    fetch("/api/auth/me/following")
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok) {
          const isFollowing = (d.writers || []).some(
            (w) => String(w._id) === String(writerId)
          );
          setFollowing(isFollowing);
        }
      })
      .catch(() => null)
      .finally(() => setChecked(true));
  }, [writerId]);

  const toggleFollow = async () => {
    if (!writerId) return;
    setBusy(true);

    const res = await fetch("/api/auth/me/following", {
      method:  following ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ writerId }),
    });

    const data = await res.json().catch(() => null);
    setBusy(false);

    // not logged in — redirect
    if (res.status === 401) {
      router.push("/login?next=" + window.location.pathname);
      return;
    }

    if (data?.ok) {
      setFollowing((v) => !v);
    }
  };

  if (!checked) {
    return <div className="h-9 w-28 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />;
  }

  return (
    <button
      type="button"
      onClick={toggleFollow}
      disabled={busy}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-extrabold transition disabled:cursor-not-allowed disabled:opacity-60
        ${following
          ? "border border-slate-200 bg-white text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          : "bg-[#003893] text-white hover:bg-[#002d7a] shadow-sm shadow-blue-900/20"
        }`}
    >
      {busy ? (
        <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
      ) : following ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          Following
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Follow
        </>
      )}
    </button>
  );
}