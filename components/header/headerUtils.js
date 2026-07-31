export function getInitials(name) {
  if (!name) return "U";
  return name.trim().split(/\s+/).map((word) => word[0]).join("").slice(0, 2).toUpperCase();
}

export function getRoleLabel(role) {
  if (role === "admin") return "Admin";
  if (role === "blog_writer") return "Blog Writer";
  return "Visitor";
}

export function getWriterPermissions(user) {
  const isAdmin = user?.role === "admin";
  const verificationStatus = user?.writerVerification?.status;
  const canApplyAsWriter =
    user?.role === "blog_writer" &&
    verificationStatus !== "pending" &&
    verificationStatus !== "approved";
  const canWritePosts =
    user?.role === "blog_writer" && verificationStatus === "approved";

  return { isAdmin, canApplyAsWriter, canWritePosts };
}
