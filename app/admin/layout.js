import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import AdminShell from "@/features/adminDashboard/components/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }) {
  const auth = await requireAdmin();
  if (!auth.ok) redirect("/login?next=/admin/dashboard");

  return <AdminShell user={auth.user}>{children}</AdminShell>;
}