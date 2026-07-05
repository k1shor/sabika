import { redirect } from "next/navigation";
import Container from "@/components/Container";
import { requireAdmin } from "@/lib/auth";
import AdminUsersPanel from "../AdminUsersPanel";

export const dynamic = "force-dynamic";

export default async function AdminUsersManagePage() {
  const auth = await requireAdmin();
  if (!auth.ok) redirect("/login?next=/admin/users/manage");

  return (
    <Container>
      <div className="grid gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Manage Users</h1>
          <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-blue-100/60">
            Search users, change roles, and manage account access from a dedicated page.
          </p>
        </div>
        <AdminUsersPanel currentUserId={auth.user.id} />
      </div>
    </Container>
  );
}
