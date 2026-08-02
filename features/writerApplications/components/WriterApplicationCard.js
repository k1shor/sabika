"use client";

import Button from "@/components/Button";
import TextArea from "@/components/TextArea";
import { CATEGORY_LABELS, formatDate, statusClass } from "../utils/applicationUtils";

export default function WriterApplicationCard({
  application,
  isBusy,
  rejectionReason,
  onReasonChange,
  onReview,
}) {
  const verification = application.writerVerification || {};
  const isPending = verification.status === "pending";

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/70 p-5 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
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
          {verification.reviewedAt && (
            <p className="mt-0.5 text-xs font-semibold text-slate-400 dark:text-blue-100/40">
              Reviewed {formatDate(verification.reviewedAt)}
            </p>
          )}
        </div>

        <ApplicationDetails verification={verification} />
      </div>

      {verification.status === "rejected" && verification.rejectionReason && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-400/30 dark:bg-red-500/15 dark:text-red-200">
          Rejection reason: {verification.rejectionReason}
        </div>
      )}

      {isPending ? (
        <PendingReviewActions
          applicationId={application._id}
          isBusy={isBusy}
          rejectionReason={rejectionReason}
          onReasonChange={onReasonChange}
          onReview={onReview}
        />
      ) : (
        <ReviewedStatus status={verification.status} />
      )}
    </div>
  );
}

function ApplicationDetails({ verification }) {
  return (
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
  );
}

function PendingReviewActions({
  applicationId,
  isBusy,
  rejectionReason,
  onReasonChange,
  onReview,
}) {
  return (
    <div className="mt-5 grid gap-3">
      <TextArea
        value={rejectionReason}
        onChange={(e) => onReasonChange(e.target.value)}
        placeholder="Optional rejection reason (shown to writer if rejected)"
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={isBusy}
          onClick={() => onReview(applicationId, "approved")}
        >
          {isBusy ? "Saving..." : "Approve Writer"}
        </Button>
        <button
          type="button"
          disabled={isBusy}
          onClick={() => onReview(applicationId, "rejected")}
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-extrabold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-400/30 dark:bg-red-500/15 dark:text-red-200"
        >
          Reject
        </button>
      </div>
    </div>
  );
}

function ReviewedStatus({ status }) {
  return (
    <div className={`mt-4 rounded-2xl px-4 py-3 text-sm font-semibold
      ${status === "approved"
        ? "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/15 dark:text-emerald-200"
        : "border border-red-200 bg-red-50 text-red-700 dark:border-red-400/20 dark:bg-red-500/15 dark:text-red-200"
      }`}
    >
      {status === "approved"
        ? "This writer has been approved and can publish posts."
        : "This application was rejected."
      }
    </div>
  );
}
