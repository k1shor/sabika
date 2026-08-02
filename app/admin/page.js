import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const auth = await requireAdmin();
  if (!auth.ok) redirect("/login?next=/admin");
  redirect("/admin/dashboard");
}