"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Container from "@/components/Container";
import Button from "@/components/Button";
import TextArea from "@/components/TextArea";

const CATEGORY_LABELS = {
  entrance_exam_passed:  "Entrance exam-passed student",
  nursing_student:       "Nursing student",
  registered_nurse:      "Registered nurse",
  nurse_working_nepal:   "Nurse working in Nepal",
  nurse_studying_abroad: "Nurse studying abroad",
  nurse_working_abroad:  "Nurse working abroad",
};

function formatDate(value) {
  if (!value) return "Not submitted";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not submitted";
  return date.toLocaleString();
}

function statusClass(status) {
  if (status === "approved") return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200";
  if (status === "rejected") return "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-200";
  return "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200";
}

export default function WriterApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [busyId, setBusyId]             = useState(null);
  const [message, setMessage]           = useState(null);
  const [loadError, setLoadError]       = useState(false);
  const [reasonById, setReasonById]     = useState({});
  const [filter, setFilter]             = useState("pending"); // default to pending

  const load = async () => {
    setLoading(true);
    setMessage(null);

    const res  = await fetch("/api/admin/writer-applications", { cache: "no-store" });
    const data = await res.json().catch(() => null);

    setLoading(false);

    if (!data?.ok) {
      setMessage(data?.error || "Unable to load writer applications.");
      setLoadError(true);
      setApplications([]);
      return;
    }

    setLoadError(false);
    setApplications(Array.isArray(data.applications) ? data.applications : []);
  };

  useEffect(() => { load(); }, []);

  const review = async (id, status) => {
    setBusyId(id);
    setMessage(null);

    try {
      const res  = await fetch(`/api/admin/writer-applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          rejectionReason: reasonById[id] || "",
        }),
      });
      const data = await res.json().catch(() => null);

      if (!data?.ok) {
        setMessage(data?.error || "Review failed.");
        return;
      }

      setApplications((list) =>
        list.map((item) => (item._id === id ? data.application : item))
      );
      setMessage(status === "approved" ? "Writer approved successfully." : "Writer rejected.");
    } catch (err) {
      setMessage(err.message || "Review failed.");
    } finally {
      setBusyId(null);
    }
  };

  // filter applications by status
  const filtered = filter === "all"
    ? applications
    : applications.filter((a) => (a.writerVerification?.status || "pending") === filter);

  const counts = {
    all:      applications.length,
    pending:  applications.filter((a) => a.writerVerification?.status === "pending").length,
    approved: applications.filter((a) => a.writerVerification?.status === "approved").length,
    rejected: applications.filter((a) => a.writerVerification?.status === "rejected").length,
  };

  return (
    <Container>
      <div className="grid gap-6">

        {/* Header */}
        <div className="rounded-3xl border border-slate-200 bg-white/70 p-7 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-sm font-semibold text-slate-600 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100/80">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Admin Review
              </div>
              <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Writer Applications
              </h1>
              <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-blue-100/70">
                Review proof documents before a blog writer can publish posts.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin"
                className="rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-extrabold text-slate-700 transition hover:bg-white dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100"
              >
                Admin dashboard
              </Link>
              <Button type="button" disabled={loading || Boolean(busyId)} onClick={load}>
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="flex flex-wrap gap-2">
          {["pending", "approved", "rejected", "all"].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold border transition
                ${filter === f
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-slate-200 text-slate-600 dark:border-blue-400/20 dark:text-blue-100/70"
                }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="ml-1.5 opacity-60">({counts[f]})</span>
            </button>
          ))}
        </div>

        {/* Message */}
        {message && (
          <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100/80">
            {message}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white/70 p-7 text-sm font-semibold text-slate-600 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25 dark:text-blue-100/70">
            Loading applications...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white/70 p-7 text-sm font-semibold text-slate-600 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25 dark:text-blue-100/70">
            No {filter === "all" ? "" : filter} applications found.
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((application) => {
              const verification = application.writerVerification || {};
              const isBusy       = busyId === application._id;
              const isPending    = verification.status === "pending";

              return (
                <div
                  key={application._id}
                  className="rounded-3xl border border-slate-200 bg-white/70 p-5 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                          {application.name || "Unnamed user"}
                        </h2>
                        <span className={`rounded-full px-2 py-1 text-xs font-extrabold ${statusClass(verification.status)}`}>
                          {verification.status || "none"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-blue-100/70">
                        {application.email}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-blue-100/55">
                        Submitted {formatDate(verification.submittedAt)}
                      </p>
                      {/* Show reviewed date if resolved */}
                      {verification.reviewedAt && (
                        <p className="mt-0.5 text-xs font-semibold text-slate-400 dark:text-blue-100/40">
                          Reviewed {formatDate(verification.reviewedAt)}
                        </p>
                      )}
                    </div>

                    <div className="grid gap-2 text-sm font-semibold text-slate-700 dark:text-blue-100/75 lg:min-w-80">
                      <div>
                        <span className="font-extrabold text-slate-900 dark:text-white">Category:</span>{" "}
                        {CATEGORY_LABELS[verification.category] || verification.category || "Not provided"}
                      </div>
                      {verification.licenseNo && (
                        <div>
                          <span className="font-extrabold text-slate-900 dark:text-white">License:</span>{" "}
                          {verification.licenseNo}
                        </div>
                      )}
                      {verification.workplace && (
                        <div>
                          <span className="font-extrabold text-slate-900 dark:text-white">Workplace:</span>{" "}
                          {verification.workplace}
                        </div>
                      )}
                      {verification.documentUrl && (
                        <a
                          href={verification.documentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-extrabold text-blue-700 hover:text-blue-600 dark:text-blue-300"
                        >
                          Open proof document
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Rejection reason display */}
                  {verification.status === "rejected" && verification.rejectionReason && (
                    <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-400/30 dark:bg-red-500/15 dark:text-red-200">
                      Rejection reason: {verification.rejectionReason}
                    </div>
                  )}

                  {/* ✅ Only show action buttons for PENDING applications */}
                  {isPending && (
                    <div className="mt-5 grid gap-3">
                      <TextArea
                        value={reasonById[application._id] || ""}
                        onChange={(e) =>
                          setReasonById((cur) => ({ ...cur, [application._id]: e.target.value }))
                        }
                        placeholder="Optional rejection reason (shown to writer if rejected)"
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          disabled={isBusy}
                          onClick={() => review(application._id, "approved")}
                        >
                          {isBusy ? "Saving..." : "Approve Writer"}
                        </Button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => review(application._id, "rejected")}
                          className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-extrabold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-400/30 dark:bg-red-500/15 dark:text-red-200"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Show resolved state clearly */}
                  {!isPending && (
                    <div className={`mt-4 rounded-2xl px-4 py-3 text-sm font-semibold
                      ${verification.status === "approved"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:border-emerald-400/20"
                        : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/15 dark:text-red-200 dark:border-red-400/20"
                      }`}
                    >
                      {verification.status === "approved"
                        ? "✓ This writer has been approved and can publish posts."
                        : "✗ This application was rejected."
                      }
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Container>
  );
}