"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/Button";
import TextArea from "@/components/TextArea";
import { fetchReports, updateReport } from "../services/reportService";
import { REPORT_STATUSES, REPORT_TARGET_TYPES, formatReportDate, reportLabel } from "../utils/reportUtils";

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [status, setStatus] = useState("open");
  const [targetType, setTargetType] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState("");
  const [notesById, setNotesById] = useState({});

  const load = async (nextPage = page) => {
    setLoading(true);
    setMessage("");
    try {
      const data = await fetchReports({ page: nextPage, status, targetType });
      if (!data?.ok) {
        setMessage(data?.error || "Unable to load reports.");
        setReports([]);
        return;
      }
      setReports(Array.isArray(data.reports) ? data.reports : []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {
      setMessage("Unable to load reports.");
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const applyFilters = (event) => {
    event.preventDefault();
    setPage(1);
    load(1);
  };

  const review = async (reportId, nextStatus) => {
    setBusyId(reportId);
    setMessage("");
    try {
      const data = await updateReport(reportId, {
        status: nextStatus,
        adminNotes: notesById[reportId] || "",
      });
      if (!data?.ok) {
        setMessage(data?.error || "Unable to update report.");
        return;
      }
      setReports((list) => list.map((report) => (
        report._id === reportId ? { ...report, ...data.report } : report
      )));
      setMessage("Report updated.");
    } catch {
      setMessage("Unable to update report.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="rounded-3xl border border-slate-200 bg-white/70 p-7 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-sm font-semibold text-slate-600 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100/80">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Community Safety
            </div>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Reports
            </h1>
            <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-blue-100/70">
              Review user reports for posts, writers, misinformation, spam, and abuse.
            </p>
          </div>
          <Button type="button" disabled={loading} onClick={() => load(page)}>
            Refresh
          </Button>
        </div>
      </div>

      <form onSubmit={applyFilters} className="flex flex-wrap gap-3 rounded-3xl border border-slate-200 bg-white/70 p-4 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100"
        >
          {REPORT_STATUSES.map((item) => (
            <option key={item || "all-statuses"} value={item}>{reportLabel(item)}</option>
          ))}
        </select>
        <select
          value={targetType}
          onChange={(event) => setTargetType(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100"
        >
          {REPORT_TARGET_TYPES.map((item) => (
            <option key={item || "all-targets"} value={item}>{reportLabel(item)}</option>
          ))}
        </select>
        <Button type="submit" disabled={loading}>Filter</Button>
      </form>

      {message && (
        <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100/80">
          {message}
        </div>
      )}

      {loading ? (
        <StateCard>Loading reports...</StateCard>
      ) : reports.length === 0 ? (
        <StateCard>No reports found.</StateCard>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <ReportCard
              key={report._id}
              report={report}
              busy={busyId === report._id}
              note={notesById[report._id] ?? report.adminNotes ?? ""}
              onNoteChange={(value) => setNotesById((cur) => ({ ...cur, [report._id]: value }))}
              onReview={review}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4">
          <PagerButton disabled={page <= 1 || loading} onClick={() => { const next = page - 1; setPage(next); load(next); }}>
            Previous
          </PagerButton>
          <span className="text-xs font-semibold text-slate-500 dark:text-blue-100/50">
            Page {page} of {totalPages}
          </span>
          <PagerButton disabled={page >= totalPages || loading} onClick={() => { const next = page + 1; setPage(next); load(next); }}>
            Next
          </PagerButton>
        </div>
      )}
    </div>
  );
}

function ReportCard({ report, busy, note, onNoteChange, onReview }) {
  const targetHref = report.targetType === "post"
    ? `/admin/dashboard/posts?q=${encodeURIComponent(report.targetLabel)}`
    : `/writers/${report.targetId}`;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/70 p-5 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-extrabold text-red-700 dark:bg-red-500/15 dark:text-red-200">
              {reportLabel(report.reason)}
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600 dark:bg-blue-950/50 dark:text-blue-100/70">
              {reportLabel(report.status)}
            </span>
            <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700 dark:bg-blue-500/15 dark:text-blue-100">
              {reportLabel(report.targetType)}
            </span>
          </div>
          <h2 className="mt-3 text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {report.targetLabel || report.targetId}
          </h2>
          <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-blue-100/70">
            Reported by {report.reporterName || report.reporterEmail || "Unknown user"} on {formatReportDate(report.createdAt)}
          </p>
          {report.details && (
            <p className="mt-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100/80">
              {report.details}
            </p>
          )}
          <Link href={targetHref} className="mt-3 inline-flex text-sm font-extrabold text-blue-700 hover:underline dark:text-blue-300">
            Open target
          </Link>
        </div>

        <div className="grid gap-3 lg:w-80">
          <TextArea
            value={note}
            onChange={(event) => onNoteChange(event.target.value)}
            placeholder="Internal admin notes"
          />
          <div className="flex flex-wrap gap-2">
            {["reviewed", "dismissed", "action_taken"].map((nextStatus) => (
              <button
                key={nextStatus}
                type="button"
                disabled={busy}
                onClick={() => onReview(report._id, nextStatus)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100"
              >
                {reportLabel(nextStatus)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StateCard({ children }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/70 p-7 text-sm font-semibold text-slate-600 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25 dark:text-blue-100/70">
      {children}
    </div>
  );
}

function PagerButton({ children, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 disabled:opacity-40 dark:border-blue-400/20 dark:text-blue-100"
    >
      {children}
    </button>
  );
}
