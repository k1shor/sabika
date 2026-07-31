import { AuditLog } from "@/models/AuditLog";

export function getRequestMeta(req) {
  const forwardedFor = req?.headers?.get("x-forwarded-for") || "";
  const ip = forwardedFor.split(",")[0]?.trim()
    || req?.headers?.get("x-real-ip")
    || "";

  return {
    ip,
    userAgent: req?.headers?.get("user-agent") || "",
  };
}

export async function logAdminAction({
  req,
  actor,
  action,
  targetType,
  targetId = "",
  targetLabel = "",
  metadata = {},
}) {
  try {
    const requestMeta = getRequestMeta(req);

    await AuditLog.create({
      actorId: actor?.id || actor?._id || undefined,
      actorName: actor?.name || "",
      actorEmail: actor?.email || "",
      action,
      targetType,
      targetId: targetId ? String(targetId) : "",
      targetLabel,
      metadata,
      ...requestMeta,
    });
  } catch (err) {
    console.error("Audit log failed:", err?.message || err);
  }
}
