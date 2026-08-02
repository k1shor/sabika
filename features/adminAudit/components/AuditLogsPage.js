"use client";

import { useEffect, useState } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { fetchAuditLogs } from "../services/auditService";
import { AUDIT_ACTIONS, AUDIT_TARGET_TYPES, auditLabel, formatAuditDate } from "../utils/auditUtils";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [query, setQuery] = useState("");
  const [action, setAction] = useState("");
  const [targetType, setTargetType] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = async (nextPage = page) => {
    setLoading(true);
    setMessage(null);
    try {
      const data = await fetchAuditLogs({ page: nextPage, query, action, targetType });
      if (!data?.ok) {
        setMessage(data?.error || "Unable to load audit logs.");
        setLogs([]);
        return;
      }
      setLogs(Array.isArray(data.logs) ? data.logs : []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {
      setMessage("Unable to load audit logs.");
      setLogs([]);
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

  return (
    <div className="grid gap-6">
      <div className="rounded-3xl border border-slate-200 bg-white/70 p-7 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-sm font-semibold text-slate-600 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100/80">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              Admin Safety
            </div>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Audit Logs
            </h1>
            <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-blue-100/70">
              Track admin role changes, bans, writer reviews, and post moderation actions.
            </p>
          </div>
          <Button type="button" disabled={loading} onClick={() => load(page)}>
            Refresh
          </Button>
        </div>
      </div>

      <form onSubmit={applyFilters} className="grid gap-3 rounded-3xl border border-slate-200 bg-white/70 p-4 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25 lg:grid-cols-[1fr_220px_190px_auto]">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search actor, target, or action"
        />
        <select
          value={action}
          onChange={(event) => setAction(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100"
        >
          {AUDIT_ACTIONS.map((item) => (
            <option key={item || "all-actions"} value={item}>{auditLabel(item)}</option>
          ))}
        </select>
        <select
          value={targetType}
          onChange={(event) => setTargetType(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100"
        >
          {AUDIT_TARGET_TYPES.map((item) => (
            <option key={item || "all-targets"} value={item}>{auditLabel(item)}</option>
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
        <StateCard>Loading audit logs...</StateCard>
      ) : logs.length === 0 ? (
        <StateCard>No audit logs found.</StateCard>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white/70 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
          {logs.map((log) => (
            <div key={log._id} className="grid gap-3 border-b border-slate-200 p-4 last:border-b-0 dark:border-blue-400/20 lg:grid-cols-[1fr_auto]">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-extrabold text-blue-700 dark:bg-blue-500/15 dark:text-blue-100">
                    {auditLabel(log.action)}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600 dark:bg-blue-950/50 dark:text-blue-100/70">
                    {auditLabel(log.targetType)}
                  </span>
                </div>
                <p className="mt-2 text-sm font-extrabold text-slate-900 dark:text-white">
                  {log.targetLabel || log.targetId || "Unknown target"}
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-blue-100/70">
                  By {log.actorName || log.actorEmail || "Unknown admin"}
                </p>
              </div>
              <div className="text-left text-xs font-semibold text-slate-500 dark:text-blue-100/55 lg:text-right">
                <div>{formatAuditDate(log.createdAt)}</div>
                {log.ip && <div className="mt-1">IP {log.ip}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => {
              const nextPage = page - 1;
              setPage(nextPage);
              load(nextPage);
            }}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 disabled:opacity-40 dark:border-blue-400/20 dark:text-blue-100"
          >
            Previous
          </button>
          <span className="text-xs font-semibold text-slate-500 dark:text-blue-100/50">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() => {
              const nextPage = page + 1;
              setPage(nextPage);
              load(nextPage);
            }}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 disabled:opacity-40 dark:border-blue-400/20 dark:text-blue-100"
          >
            Next
          </button>
        </div>
      )}
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
