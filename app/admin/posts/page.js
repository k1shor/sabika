import { redirect } from "next/navigation";
import Container from "@/components/Container";
import { requireAdmin } from "@/lib/auth";
import AdminPostsPanel from "./AdminPostsPanel";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const auth = await requireAdmin();
  if (!auth.ok) redirect("/login?next=/admin/posts");

  return (
    <Container>
      <div className="grid gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Manage Posts</h1>
          <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-blue-100/60">
            Review, approve, reject, edit, or remove posts from one focused page.
          </p>
        </div>
        <AdminPostsPanel />
      </div>
    </Container>
  );
}
