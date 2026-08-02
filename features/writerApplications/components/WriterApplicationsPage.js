"use client";

import { useEffect, useState } from "react";
import { fetchWriterApplications, reviewWriterApplication } from "../services/applicationService";
import { applicationCounts, filterApplications } from "../utils/applicationUtils";
import ApplicationsFilterTabs from "./ApplicationsFilterTabs";
import ApplicationsHeader from "./ApplicationsHeader";
import WriterApplicationCard from "./WriterApplicationCard";

export default function WriterApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState(null);
  const [reasonById, setReasonById] = useState({});
  const [filter, setFilter] = useState("pending");

  const load = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const data = await fetchWriterApplications();

      if (!data?.ok) {
        setMessage(data?.error || "Unable to load writer applications.");
        setApplications([]);
        return;
      }

      setApplications(Array.isArray(data.applications) ? data.applications : []);
    } catch {
      setMessage("Unable to load writer applications.");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const review = async (id, status) => {
    setBusyId(id);
    setMessage(null);

    try {
      const data = await reviewWriterApplication(id, {
        status,
        rejectionReason: reasonById[id] || "",
      });

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

  const filtered = filterApplications(applications, filter);
  const counts = applicationCounts(applications);

  return (
    <div className="grid gap-6">
      <ApplicationsHeader loading={loading} busy={Boolean(busyId)} onRefresh={load} />

      <ApplicationsFilterTabs filter={filter} counts={counts} onFilterChange={setFilter} />

      {message && (
        <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100/80">
          {message}
        </div>
      )}

      {loading ? (
        <ApplicationsState>Loading applications...</ApplicationsState>
      ) : filtered.length === 0 ? (
        <ApplicationsState>No {filter === "all" ? "" : filter} applications found.</ApplicationsState>
      ) : (
        <div className="grid gap-4">
          {filtered.map((application) => (
            <WriterApplicationCard
              key={application._id}
              application={application}
              isBusy={busyId === application._id}
              rejectionReason={reasonById[application._id] || ""}
              onReasonChange={(value) =>
                setReasonById((cur) => ({ ...cur, [application._id]: value }))
              }
              onReview={review}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ApplicationsState({ children }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/70 p-7 text-sm font-semibold text-slate-600 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25 dark:text-blue-100/70">
      {children}
    </div>
  );
}
