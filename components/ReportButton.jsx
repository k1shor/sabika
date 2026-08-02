"use client";

import { useState } from "react";
import TextArea from "@/components/TextArea";

const REASONS = [
  ["medical_misinformation", "Medical misinformation"],
  ["unsafe_advice", "Unsafe advice"],
  ["fake_credentials", "Fake credentials"],
  ["harassment", "Harassment"],
  ["spam", "Spam"],
  ["other", "Other"],
];

export default function ReportButton({ targetType, targetId, label = "Report" }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("medical_misinformation");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId, reason, details }),
      });
      const data = await res.json().catch(() => null);

      if (!data?.ok) {
        setMessage(data?.error || "Report failed.");
        return;
      }

      setMessage(data.message || "Report submitted.");
      setDetails("");
    } catch {
      setMessage("Report failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setMessage("");
        }}
        className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-extrabold text-red-700 transition hover:bg-red-100 dark:border-red-400/30 dark:bg-red-500/15 dark:text-red-200"
      >
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
          <form
            onSubmit={submit}
            className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-blue-400/20 dark:bg-slate-950"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Report {targetType}
                </h2>
                <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-blue-100/70">
                  Admins will review this report.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 dark:text-blue-100/60 dark:hover:bg-blue-950/40"
                aria-label="Close report dialog"
              >
                X
              </button>
            </div>

            <label className="mt-5 block text-sm font-extrabold text-slate-800 dark:text-blue-100">
              Reason
            </label>
            <select
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100"
            >
              {REASONS.map(([value, text]) => (
                <option key={value} value={value}>{text}</option>
              ))}
            </select>

            <label className="mt-4 block text-sm font-extrabold text-slate-800 dark:text-blue-100">
              Details
            </label>
            <div className="mt-2">
              <TextArea
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                placeholder="Add context for the admin team"
              />
            </div>

            {message && (
              <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100/80">
                {message}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50 dark:border-blue-400/20 dark:text-blue-100 dark:hover:bg-blue-950/30"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={busy}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? "Sending..." : "Submit report"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
