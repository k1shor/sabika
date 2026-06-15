"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Container from "@/components/Container";

function formatDate(value) {
  const date = new Date(value || 0);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/auth/me/notifications", { cache: "no-store" });
    const data = await res.json().catch(() => null);

    setLoading(false);

    if (!data?.ok) {
      setMessage(data?.error || "Login required to view notifications.");
      setNotifications([]);
      return;
    }

    setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
  };

  const markAllRead = async () => {
    await fetch("/api/auth/me/notifications", { method: "PATCH" }).catch(() => null);
    await load();
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  return (
    <Container>
      <div className="rounded-3xl border border-slate-200 bg-white/70 p-7 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Notifications
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-blue-100/70">
              New posts from writers you follow.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={markAllRead}
              disabled={loading || notifications.length === 0}
              className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-600 disabled:opacity-60"
            >
              Mark all read
            </button>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 text-sm font-semibold text-slate-500 dark:text-blue-100/60">
            Loading notifications...
          </div>
        ) : message ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100">
            {message}
          </div>
        ) : notifications.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-600 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100/70">
            No notifications yet.
          </div>
        ) : (
          <div className="mt-6 grid gap-3">
            {notifications.map((item) => (
              <Link
                key={item._id}
                href={item.postSlug ? `/blogs/${item.postSlug}` : "/notifications"}
                className="rounded-2xl border border-slate-200 bg-white/80 p-4 transition hover:border-blue-300 hover:bg-white dark:border-blue-400/20 dark:bg-blue-950/30 dark:hover:bg-blue-950/45"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {item.message}
                    </div>
                    <div className="mt-1 text-xs font-semibold text-slate-500 dark:text-blue-100/60">
                      {formatDate(item.createdAt)}
                    </div>
                  </div>
                  {!item.read ? (
                    <span className="rounded-full bg-red-500 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white">
                      New
                    </span>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
