"use client";

import Link from "next/link";
import Container from "./Container";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const subscribe = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    const value = email.trim().toLowerCase();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    await new Promise((r) => setTimeout(r, 700));

    setLoading(false);

    if (!ok) {
      setStatus({ type: "error", message: "Please enter a valid email address." });
      return;
    }

    setEmail("");
    setStatus({ type: "success", message: "Subscribed successfully. Thank you!" });
  };

  return (
    <footer className="border-t border-slate-200 bg-white/80 backdrop-blur dark:border-blue-400/20 dark:bg-slate-950/80">
      <Container>
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-600 to-red-500 shadow-sm" />
              <div className="leading-tight">
                <div className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Nursing Nepal
                </div>
                <div className="text-xs font-semibold text-slate-500 dark:text-blue-100/70">
                  Care • Education • Guidance
                </div>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-blue-100/75">
              Nursing Nepal is an informational platform designed to support nursing students,
              healthcare professionals, and families with helpful care guides, learning resources,
              and health awareness articles.
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100/80">
              Built with Next.js + Tailwind
            </div>
          </div>

          <div>
            <div className="text-sm font-extrabold text-slate-900 dark:text-white">
              Quick Links
            </div>

            <div className="mt-4 grid gap-2 text-sm font-semibold text-slate-600 dark:text-blue-100/75">
              <Link className="hover:text-blue-600 dark:hover:text-red-300 transition" href="/">
                Home
              </Link>
              <Link className="hover:text-blue-600 dark:hover:text-red-300 transition" href="/about">
                About
              </Link>
              <Link className="hover:text-blue-600 dark:hover:text-red-300 transition" href="/blogs">
                Articles
              </Link>
              <Link className="hover:text-blue-600 dark:hover:text-red-300 transition" href="/faq">
                FAQ
              </Link>
              <Link className="hover:text-blue-600 dark:hover:text-red-300 transition" href="/contact">
                Contact
              </Link>
            </div>
          </div>

          <div>
            <div className="text-sm font-extrabold text-slate-900 dark:text-white">
              Subscribe
            </div>

            <p className="mt-3 text-sm text-slate-600 dark:text-blue-100/75">
              Get nursing updates and health articles delivered to your inbox.
            </p>

            <form onSubmit={subscribe} className="mt-4 flex flex-col gap-3">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                type="email"
                className="w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm outline-none
                focus:ring-4 focus:ring-blue-500/15 focus:border-blue-400
                dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-white dark:placeholder:text-blue-100/50"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-red-500 px-4 py-2 text-sm font-semibold text-white shadow-sm
                hover:brightness-110 active:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? "Subscribing..." : "Subscribe"}
              </button>

              {status && (
                <div
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                    status.type === "success"
                      ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/25 dark:bg-blue-950/30 dark:text-blue-200"
                      : "border-red-200 bg-red-50 text-red-700 dark:border-red-400/25 dark:bg-red-950/30 dark:text-red-200"
                  }`}
                >
                  {status.message}
                </div>
              )}
            </form>

            <div className="mt-3 text-xs text-slate-500 dark:text-blue-100/60">
              No spam. Unsubscribe anytime.
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-t border-slate-200 pt-6 dark:border-blue-400/20">
          <div className="text-sm text-slate-500 dark:text-blue-100/70">
            © {new Date().getFullYear()} <span className="font-semibold">Nursing Nepal</span>. All rights reserved.
          </div>

          <div className="text-sm text-slate-500 dark:text-blue-100/70">
            Designed with <span className="text-red-500">❤</span> for healthcare learning.
          </div>
        </div>
      </Container>
    </footer>
  );
}
