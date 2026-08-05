import { Suspense } from "react";
import AdminDashboardTabs from "@/features/adminDashboard/components/AdminDashboardTabs";
import { getAdminDashboardData } from "@/features/adminDashboard/services/dashboardData";

export const dynamic = "force-dynamic";

export default async function AdminDashboardViewPage({ params }) {
  const { view } = await params;
  const data = await getAdminDashboardData();

  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />}>
      <AdminDashboardTabs {...data} activeView={view} />
    </Suspense>
  );
}
