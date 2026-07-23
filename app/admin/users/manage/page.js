import { getAuthUser } from "@/lib/auth";
import AdminUsersPanel from "@/features/adminUsers/components/AdminUsersPanel";

export default async function AdminUsersManagePage() {
  const user = await getAuthUser();

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Manage Users</h1>
        <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-blue-100/60">
          Search users, change roles, and manage account access from a dedicated page.
        </p>
      </div>
      <AdminUsersPanel currentUserId={user?.id} />
    </div>
  );
}