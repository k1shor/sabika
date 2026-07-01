"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BellIcon } from "./HeaderIcons";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/auth/me/notifications", { cache: "no-store" });
    const data = await res.json().catch(() => null);
    setLoading(false);
    if (data?.ok) setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
  };

  const markAllRead = async () => {
    await fetch("/api/auth/me/notifications", { method: "PATCH" }).catch(() => null);
    await load();
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  useEffect(() => {
    function handleClick(event) {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => { setOpen((value) => !value); load(); }}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white/80 text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-700 dark:border-blue-400/20 dark:bg-blue-950/50 dark:text-blue-100 dark:hover:bg-blue-950/70"
        aria-label="Notifications"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-extrabold text-white ring-2 ring-white dark:ring-slate-950">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/50 dark:border-blue-400/20 dark:bg-slate-900 dark:shadow-none">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-blue-400/10 bg-linear-to-r from-slate-50 to-white dark:from-blue-950/20 dark:to-transparent">
            <div>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white">Notifications</p>
              <p className="text-xs font-semibold text-slate-400 dark:text-blue-100/50">{unreadCount} unread</p>
            </div>
            <button type="button" onClick={markAllRead} disabled={unreadCount === 0} className="text-xs font-bold text-blue-600 hover:text-blue-700 transition disabled:text-slate-300 dark:text-blue-300 dark:disabled:text-blue-100/20">
              Mark all read
            </button>
          </div>
          <div className="max-h-72 overflow-y-auto p-2">
            {loading ? (
              <div className="py-8 text-center text-sm text-slate-400">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-2xl mb-2">🔔</p>
                <p className="text-sm font-semibold text-slate-400">No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 5).map((item) => (
                <Link key={item._id} href={item.postSlug ? `/blogs/${item.postSlug}` : "/notifications"} onClick={() => setOpen(false)} className="flex items-start gap-3 rounded-xl px-3 py-3 transition hover:bg-slate-50 dark:hover:bg-blue-950/40">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.read ? "bg-slate-200 dark:bg-blue-100/20" : "bg-red-500"}`} />
                  <p className="text-sm font-semibold leading-snug text-slate-700 dark:text-blue-100/80">{item.message}</p>
                </Link>
              ))
            )}
          </div>
          <Link href="/notifications" onClick={() => setOpen(false)} className="block border-t border-slate-100 px-4 py-3 text-center text-sm font-bold text-blue-700 transition hover:bg-slate-50 dark:border-blue-400/10 dark:text-blue-300 dark:hover:bg-blue-950/40">
            View all notifications →
          </Link>
        </div>
      )}
    </div>
  );
}
