import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getAuthUser();
  if (user?.role === "admin") {
    redirect("/admin/dashboard");
  }
  redirect("/dashboard/profile");
}
