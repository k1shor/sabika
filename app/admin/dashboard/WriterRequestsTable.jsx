"use client";

import { useState } from "react";
import Link from "next/link";

function formatCategory(cat) {
  if (!cat) return "—";
  return cat.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function WriterRow({ writer, onAction }) {
  const [loading, setLoading] = useState("");

  const handle = async (action) => {
    setLoading(action);
    await onAction(writer._id, action);
    setLoading("");
  };

  return (
    <tr className="border-b border-slate-100 dark:border-blue-400/10 hover:bg-slate-50/50 dark:hover:bg-blue-950/20 transition">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
            {writer.name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-white">{writer.name}</p>
            <p className="text-xs text-slate-400">{writer.email}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4 text-sm text-slate-600 dark:text-blue-100/70">
        {formatCategory(writer.category)}
      </td>
      <td className="py-3 px-4 text-sm text-slate-600 dark:text-blue-100/70">
        {writer.workplace}
      </td>
      <td className="py-3 px-4">
        {writer.documentUrl ? (
          <a href={writer.documentUrl} target="_blank" rel="noreferrer"
            className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400">
            View doc
          </a>
        ) : (
          <span className="text-xs text-slate-400">No doc</span>
        )}
      </td>
      <td className="py-3 px-4">
        <span className="rounded-full bg-yellow-50 border border-yellow-200 px-3 py-1 text-xs font-bold text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-300 dark:border-yellow-400/20">
          Pending
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handle("approved")}
            disabled={!!loading}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading === "approved" ? "..." : "Approve"}
          </button>
          <button
            onClick={() => handle("rejected")}
            disabled={!!loading}
            className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 transition disabled:opacity-50 dark:border-red-400/20 dark:bg-transparent dark:text-red-400"
          >
            {loading === "rejected" ? "..." : "Reject ✕"}
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function WriterRequestsTable({ initialWriters = [] }) {
  const [writers, setWriters] = useState(initialWriters);

  const handleAction = async (id, status) => {
    const res = await fetch(`/api/admin/writer-applications/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ status }),
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
          View all & full review →
        </Link>
      </div>

      {writers.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">No pending writer requests.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-blue-400/10">
                {["Profile", "Category", "Workplace", "Document", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-blue-100/40">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {writers.map((w) => (
                <WriterRow key={w._id} writer={w} onAction={handleAction} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}