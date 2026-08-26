import { redirect } from "next/navigation";
import DashboardWorkspace from "@/components/dashboard/DashboardWorkspace";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardSectionPage({ params }) {
  const { section } = await params;
  const user = await getAuthUser();

  if (user?.role === "admin" && section === "overview") {
    redirect("/admin/dashboard");
  }

  return <DashboardWorkspace section={section} />;
}
