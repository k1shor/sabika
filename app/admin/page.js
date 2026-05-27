import { redirect } from "next/navigation";
import Link from "next/link";
import Container from "@/components/Container";
import AdminPostsPanel from "./posts/AdminPostsPanel";
import AdminUsersPanel from "./users/AdminUsersPanel";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const auth = await requireAdmin();

  if (!auth.ok) {
    redirect("/login?next=/admin");
  }

  return (
    <Container>
      <div className="rounded-3xl border border-slate-200 bg-white/70 p-7 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-sm font-semibold text-slate-600 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100/80">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Admin CMS
            </div>

            <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-slate-600 dark:text-blue-100/75">
              Manage Nursing Nepal articles and account roles.
            </p>
          </div>

          <div className="grid gap-3 text-sm font-semibold text-slate-700 dark:text-blue-100/80">
            <div>
              Logged in as{" "}
              <span className="font-extrabold text-slate-900 dark:text-white">
                {auth.user?.email}
              </span>
            </div>
            <Link
              href="/admin/writer-applications"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-extrabold text-slate-700 transition hover:bg-white dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100"
            >
              Review writer applications
            </Link>
          </div>
        </div>

        <div className="mt-6">
          <AdminPostsPanel />
        </div>

        <div className="mt-6">
          <AdminUsersPanel />
        </div>
      </div>
    </Container>
  );
}
