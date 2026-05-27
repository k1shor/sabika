"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Container from "@/components/Container";
import Button from "@/components/Button";
import TextArea from "@/components/TextArea";

const CATEGORY_LABELS = {
  entrance_exam_passed: "Entrance exam-passed student",
  nursing_student: "Nursing student",
  registered_nurse: "Registered nurse",
  nurse_working_nepal: "Nurse working in Nepal",
  nurse_studying_abroad: "Nurse studying abroad",
  nurse_working_abroad: "Nurse working abroad",
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
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [reasonById, setReasonById] = useState({});

  const load = async () => {
    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/admin/writer-applications", { cache: "no-store" });
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const review = async (id, status) => {
    setBusyId(id);
    setMessage(null);

    const res = await fetch(`/api/admin/writer-applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        rejectionReason: reasonById[id] || "",
      }),
    });
    const data = await res.json().catch(() => null);

    setBusyId(null);

    if (!data?.ok) {
      setMessage(data?.error || "Review failed.");
      return;
    }

    setApplications((list) =>
      list.map((item) => (item._id === id ? data.application : item))
    );
    setMessage(status === "approved" ? "Writer approved." : "Writer rejected.");
  };

  return (
    <Container>
      <div className="grid gap-6">
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
              <Link href="/admin" className="rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-extrabold text-slate-700 transition hover:bg-white dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100">
                Admin dashboard
              </Link>
              <Button type="button" disabled={loading || Boolean(busyId)} onClick={load}>
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {message ? (
          <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100/80">
            {message}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white/70 p-7 text-sm font-semibold text-slate-600 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25 dark:text-blue-100/70">
            Loading applications...
          </div>
        ) : loadError ? null : applications.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white/70 p-7 text-sm font-semibold text-slate-600 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25 dark:text-blue-100/70">
            No writer applications yet.
          </div>
        ) : (
          <div className="grid gap-4">
            {applications.map((application) => {
              const verification = application.writerVerification || {};
              const isBusy = busyId === application._id;

              return (
                <div key={application._id} className="rounded-3xl border border-slate-200 bg-white/70 p-5 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
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
                    </div>

                    <div className="grid gap-2 text-sm font-semibold text-slate-700 dark:text-blue-100/75 lg:min-w-80">
                      <div>
                        <span className="font-extrabold text-slate-900 dark:text-white">Category:</span>{" "}
                        {CATEGORY_LABELS[verification.category] || verification.category || "Not provided"}
                      </div>
                      {verification.licenseNo ? (
                        <div>
                          <span className="font-extrabold text-slate-900 dark:text-white">License:</span>{" "}
                          {verification.licenseNo}
                        </div>
                      ) : null}
                      {verification.workplace ? (
                        <div>
                          <span className="font-extrabold text-slate-900 dark:text-white">Workplace:</span>{" "}
                          {verification.workplace}
                        </div>
                      ) : null}
                      {verification.documentUrl ? (
                        <a href={verification.documentUrl} target="_blank" rel="noreferrer" className="font-extrabold text-blue-700 hover:text-blue-600 dark:text-blue-300">
                          Open proof document
                        </a>
                      ) : null}
                    </div>
                  </div>

                  {verification.status === "rejected" && verification.rejectionReason ? (
                    <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-400/30 dark:bg-red-500/15 dark:text-red-200">
                      {verification.rejectionReason}
                    </div>
                  ) : null}

                  <div className="mt-5 grid gap-3">
                    <TextArea
                      value={reasonById[application._id] || ""}
                      onChange={(event) =>
                        setReasonById((current) => ({
                          ...current,
                          [application._id]: event.target.value,
                        }))
                      }
                      placeholder="Optional rejection reason"
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" disabled={isBusy} onClick={() => review(application._id, "approved")}>
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Container>
  );
}
