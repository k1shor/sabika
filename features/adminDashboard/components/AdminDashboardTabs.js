"use client";

import { Suspense } from "react";
import AdminPostsPanel from "@/features/adminPosts/components/AdminPostsPanel";
import AdminReportsPage from "@/features/adminReports/components/AdminReportsPage";
import AuditLogsPage from "@/features/adminAudit/components/AuditLogsPage";
import AdminUsersPanel from "@/features/adminUsers/components/AdminUsersPanel";
import AdminContactMessagesPage from "@/features/adminContact/components/AdminContactMessagesPage";
import ProfileTab from "@/components/profile/ProfileTab";
import WriterApplicationsPage from "@/features/writerApplications/components/WriterApplicationsPage";
import AdminFaqsPanel from "@/features/adminFaqs/components/AdminFaqsPanel";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import StatCard from "./StatCard";
import ActivityFeed from "./ActivityFeed";
import WriterRequestsTable from "./WriterRequestsTable";
import { ChartPanel, PostsAreaChart, UsersBarChart, PostStatusDonut } from "./charts";
import { IconPosts, IconUsers, IconWriter, IconFlag, IconBan } from "../icons/icons";

export default function AdminDashboardTabs({
  stats,
  postsPerDay,
  usersPerWeek,
  postStatusCounts,
  activity,
  writerRequests,
  user,
  activeView = "overview",
}) {
  const postsThisWeek = (postsPerDay || []).reduce((sum, d) => sum + d.count, 0);
  const usersThisPeriod = (usersPerWeek || []).reduce((sum, d) => sum + d.count, 0);

  if (activeView === "posts") {
    return (
      <AdminViewFrame title="Manage Posts" description="Review, approve, reject, edit, or remove posts from one focused page.">
        <Suspense fallback={<AdminPanelLoading />}>
          <AdminPostsPanel />
        </Suspense>
      </AdminViewFrame>
    );
  }

  if (activeView === "users") {
    return (
      <AdminViewFrame title="Manage Users" description="Search users, change roles, and manage account access.">
        <AdminUsersPanel currentUserId={user?.id} />
      </AdminViewFrame>
    );
  }

  if (activeView === "writers") return <WriterApplicationsPage />;
  if (activeView === "reports") return <AdminReportsPage />;
  if (activeView === "audit") return <AuditLogsPage />;
  if (activeView === "contact") return <AdminContactMessagesPage />;
  if (activeView === "faqs") return <AdminFaqsPanel />;

  if (activeView === "profile") {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
        <ProfileTab user={user} />
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <WelcomeBanner user={user} />

      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Overview</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-blue-100/50">
          A snapshot of the platform right now.
        </p>
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Total Users" value={stats.totalUsers} tone="blue" Icon={IconUsers} href="/admin/dashboard/users" />
        <StatCard label="Total Blogs" value={stats.totalPosts} tone="green" Icon={IconPosts} href="/admin/dashboard/posts" />
        <StatCard label="Pending Writers" value={stats.pendingWriters} tone="yellow" Icon={IconWriter} href="/admin/dashboard/writers" />
        <StatCard label="Flagged Posts" value={stats.flaggedPosts} tone="orange" Icon={IconFlag} href="/admin/dashboard/posts" />
        <StatCard label="Banned Users" value={stats.bannedUsers} tone="red" Icon={IconBan} href="/admin/dashboard/users" />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <ChartPanel title="Posts Per Day" total={postsThisWeek} totalLabel="this week">
          <PostsAreaChart data={postsPerDay} />
        </ChartPanel>
        <ChartPanel title="New Users Per Week" total={usersThisPeriod} totalLabel="last 5 weeks">
          <UsersBarChart data={usersPerWeek} />
        </ChartPanel>
        <ChartPanel title="Post Status Breakdown">
          <PostStatusDonut counts={postStatusCounts} />
        </ChartPanel>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
          <p className="mb-4 text-sm font-extrabold text-slate-800 dark:text-white">Recent Activity</p>
          <ActivityFeed items={activity} />
        </div>
        <div className="lg:col-span-2">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Needs your attention</p>
          <WriterRequestsTable initialWriters={writerRequests || []} />
        </div>
      </section>
    </div>
  );
}

function AdminViewFrame({ title, description, children }) {
  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{title}</h1>
        <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-blue-100/60">
          {description}
        </p>
      </div>
      {children}
    </div>
  );
}

function AdminPanelLoading() {
  return <div className="h-40 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />;
}
