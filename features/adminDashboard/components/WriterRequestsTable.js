"use client";

import { useState } from "react";
import Link from "next/link";

function formatCategory(cat) {
  if (!cat) return "—";
  return cat.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function WriterCard({ writer, onAction }) {
  const [loading, setLoading] = useState("");

  const handle = async (action) => {
    let reason = "";
    if (action === "rejected") {
      const input = window.prompt("Reason for rejecting this writer (shown to them):", "");
      if (input === null) return; // cancelled
      reason = input.trim();
    }
    setLoading(action);
    await onAction(writer._id, action, reason);
    setLoading("");
  };

  const initials = writer.name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";

  return (
    <div className="p-4 border-b border-slate-100 dark:border-blue-400/10 last:border-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{writer.name}</p>
            <p className="text-xs text-slate-400 truncate">{writer.email}</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-yellow-50 border border-yellow-200 px-2.5 py-0.5 text-xs font-bold text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-300 dark:border-yellow-400/20">
          Pending
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        <div>
          <p className="text-slate-400 dark:text-blue-100/40 font-semibold uppercase tracking-wide text-[10px]">Category</p>
          <p className="text-slate-700 dark:text-blue-100/80">{formatCategory(writer.category)}</p>
        </div>
        <div>
          <p className="text-slate-400 dark:text-blue-100/40 font-semibold uppercase tracking-wide text-[10px]">Workplace</p>
          <p className="text-slate-700 dark:text-blue-100/80">{writer.workplace}</p>
        </div>
        {writer.licenseNo && writer.licenseNo !== "—" && (
          <div>
            <p className="text-slate-400 dark:text-blue-100/40 font-semibold uppercase tracking-wide text-[10px]">License No.</p>
            <p className="text-slate-700 dark:text-blue-100/80">{writer.licenseNo}</p>
          </div>
        )}
        {writer.documentUrl && (
          <div>
            <p className="text-slate-400 dark:text-blue-100/40 font-semibold uppercase tracking-wide text-[10px]">Document</p>
            <a href={writer.documentUrl} target="_blank" rel="noreferrer"
              className="text-blue-600 hover:underline dark:text-blue-400">
              View doc ↗
            </a>
          </div>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => handle("approved")}
          disabled={!!loading}
          className="flex-1 rounded-lg bg-blue-600 py-2 text-xs font-bold text-white hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading === "approved" ? "..." : "Approve"}
        </button>
        <button
          onClick={() => handle("rejected")}
          disabled={!!loading}
          className="flex-1 rounded-lg border border-red-200 bg-white py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition disabled:opacity-50 dark:border-red-400/20 dark:bg-transparent dark:text-red-400"
        >
          {loading === "rejected" ? "..." : "Reject ✕"}
        </button>
      </div>
    </div>
  );
}

export default function WriterRequestsTable({ initialWriters = [] }) {
  const [writers, setWriters] = useState(initialWriters);

  const handleAction = async (id, status, rejectionReason = "") => {
    const res = await fetch(`/api/admin/writer-applications/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ status, rejectionReason }),
    });
    const data = await res.json().catch(() => null);
    if (data?.ok) {
      setWriters((prev) => prev.filter((w) => w._id !== id));
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-blue-400/10">
        <p className="text-sm font-extrabold text-slate-800 dark:text-white">
          Pending Writer Requests
          {writers.length > 0 && (
            <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
              {writers.length}
            </span>
          )}
        </p>
        <Link href="/admin/writer-applications"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">
          View all →
        </Link>
      </div>

      {writers.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">No pending writer requests.</p>
      ) : (
        <div>
          {writers.map((w) => (
            <WriterCard key={w._id} writer={w} onAction={handleAction} />
          ))}
        </div>
      )}
    </div>
  );
}