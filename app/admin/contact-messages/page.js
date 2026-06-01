"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Container from "@/components/Container";
import Button from "@/components/Button";

function formatDate(value) {
  const date = new Date(value || 0);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);

  const load = async () => {
    setLoading(true);
    setNotice(null);

    const res = await fetch("/api/admin/contact-messages", { cache: "no-store" });
    const data = await res.json().catch(() => null);

    setLoading(false);

    if (!data?.ok) {
      setNotice(data?.error || "Failed to load contact messages.");
      setMessages([]);
      return;
    }

    setMessages(Array.isArray(data.messages) ? data.messages : []);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <Container>
      <div className="grid gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white/70 p-7 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-sm font-semibold text-slate-600 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100/80">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Admin Inbox
              </div>
              <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Contact Messages
              </h1>
              <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-blue-100/70">
                Messages submitted from the contact page are saved here.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/admin" className="rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-extrabold text-slate-700 transition hover:bg-white dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100">
                Admin dashboard
              </Link>
              <Button type="button" disabled={loading} onClick={load}>
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {notice ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-400/30 dark:bg-red-500/15 dark:text-red-200">
            {notice}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white/70 p-7 text-sm font-semibold text-slate-600 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25 dark:text-blue-100/70">
            Loading contact messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white/70 p-7 text-sm font-semibold text-slate-600 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25 dark:text-blue-100/70">
            No contact messages yet.
          </div>
        ) : (
          <div className="grid gap-4">
            {messages.map((item) => (
              <div key={item._id} className="rounded-3xl border border-slate-200 bg-white/70 p-5 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      {item.name}
                    </h2>
                    <a href={`mailto:${item.email}`} className="text-sm font-bold text-blue-700 hover:text-blue-600 dark:text-blue-300">
                      {item.email}
                    </a>
                    <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-blue-100/55">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-extrabold ${
                    item.emailSent
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200"
                      : "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200"
                  }`}>
                    {item.emailSent ? "Email sent" : "Saved only"}
                  </span>
                </div>
                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700 dark:text-blue-100/80">
                  {item.message}
                </p>
                {!item.emailSent && item.emailError ? (
                  <p className="mt-3 text-xs font-semibold text-amber-700 dark:text-amber-200">
                    Email note: {item.emailError}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
