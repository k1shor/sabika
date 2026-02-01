import { redirect } from "next/navigation";
import Container from "@/components/Container";
import AdminPostsPanel from "./posts/AdminPostsPanel";
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
              Blog Management
            </h1>

            <p className="mt-2 text-slate-600 dark:text-blue-100/75">
              Manage Nursing Nepal articles (Create / Delete). Next we can add Edit.
            </p>
          </div>

          <div className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
            Logged in as{" "}
            <span className="font-extrabold text-slate-900 dark:text-white">
              {auth.user?.email}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <AdminPostsPanel />
        </div>
      </div>
    </Container>
  );
}
