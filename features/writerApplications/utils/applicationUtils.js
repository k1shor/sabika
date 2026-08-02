export const APPLICATION_FILTERS = ["pending", "approved", "rejected", "all"];

export const CATEGORY_LABELS = {
  entrance_exam_passed: "Entrance exam-passed student",
  nursing_student: "Nursing student",
  registered_nurse: "Registered nurse",
  nurse_working_nepal: "Nurse working in Nepal",
  nurse_studying_abroad: "Nurse studying abroad",
  nurse_working_abroad: "Nurse working abroad",
};

export function formatDate(value) {
  if (!value) return "Not submitted";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not submitted";
  return date.toLocaleString();
}

export function statusClass(status) {
  if (status === "approved") return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200";
  if (status === "rejected") return "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-200";
  return "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200";
}

export function filterApplications(applications, filter) {
  if (filter === "all") return applications;
  return applications.filter((application) => (
    (application.writerVerification?.status || "pending") === filter
  ));
}

export function applicationCounts(applications) {
  return {
    all: applications.length,
    pending: applications.filter((a) => a.writerVerification?.status === "pending").length,
    approved: applications.filter((a) => a.writerVerification?.status === "approved").length,
    rejected: applications.filter((a) => a.writerVerification?.status === "rejected").length,
  };
}
