import { redirect } from "next/navigation";

export default async function AdminUsersManagePage() {
  redirect("/admin/dashboard/users");
}
