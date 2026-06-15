"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Container from "@/components/Container";
import Button from "@/components/Button";

function initials(name) {
  return String(name || "W")
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function FollowingPage() {
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const unfollow = async (writerId) => {
    const res = await fetch(`/api/writers/${writerId}/follow`, { method: "DELETE" });
    const data = await res.json().catch(() => null);

    if (!data?.ok) {
      setMessage(data?.error || "Unable to unfollow writer.");
      return;
    }

    setWriters((list) => list.filter((writer) => writer._id !== writerId));
    setMessage("Writer removed from your following list.");
  };

  return (
    <Container>
      <div className="grid gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white/70 p-7 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-sm font-semibold text-slate-600 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100/80">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Visitor
              </div>
              <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                People You Follow
              </h1>
              <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-blue-100/70">
                These are the approved writers whose new posts will appear in your notifications.
              </p>
            </div>
            <Button type="button" disabled={loading} onClick={load}>
              Refresh
            </Button>
          </div>
        </div>

        {message ? (
          <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100/80">
            {message}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white/70 p-7 text-sm font-semibold text-slate-600 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25 dark:text-blue-100/70">
            Loading followed writers...
          </div>
        ) : loadError ? null : writers.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white/70 p-7 text-sm font-semibold text-slate-600 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25 dark:text-blue-100/70">
            You are not following any writer yet. Open a writer profile from a blog post and press Follow.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {writers.map((writer) => (
              <div key={writer._id} className="rounded-3xl border border-slate-200 bg-white/70 p-5 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-extrabold text-blue-700 dark:bg-blue-900/50 dark:text-blue-200">
                      {initials(writer.name)}
                    </div>
                    <div className="min-w-0">
                      <Link href={`/writers/${writer._id}`} className="block truncate text-base font-extrabold text-slate-900 hover:text-blue-700 dark:text-white dark:hover:text-blue-300">
                        {writer.name || "Unnamed writer"}
                      </Link>
                      <p className="mt-1 truncate text-xs font-semibold text-slate-500 dark:text-blue-100/60">
                        {writer.email}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-extrabold text-blue-700 dark:bg-blue-500/15 dark:text-blue-100">
                    {writer.writerStatus}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/writers/${writer._id}`} className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-xs font-extrabold text-slate-700 transition hover:bg-white dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100">
                    View Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => unfollow(writer._id)}
                    className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-extrabold text-red-700 transition hover:bg-red-100 dark:border-red-400/30 dark:bg-red-500/15 dark:text-red-200"
                  >
                    Unfollow
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
