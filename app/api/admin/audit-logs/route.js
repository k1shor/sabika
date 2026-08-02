import { NextResponse } from "next/server";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { AuditLog } from "@/models/AuditLog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function serializeLog(log) {
  return {
    _id: String(log._id),
    actorId: log.actorId ? String(log.actorId) : "",
    actorName: log.actorName || "",
    actorEmail: log.actorEmail || "",
    action: log.action || "",
    targetType: log.targetType || "",
    targetId: log.targetId || "",
    targetLabel: log.targetLabel || "",
    metadata: log.metadata || {},
    ip: log.ip || "",
    userAgent: log.userAgent || "",
    createdAt: log.createdAt instanceof Date ? log.createdAt.toISOString() : log.createdAt,
  };
}

export async function GET(req) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error || "Forbidden" }, { status: 403 });

    if (!isDbEnabled()) {
      return NextResponse.json({ ok: false, error: "Database is disabled. Enable USE_DB=true" }, { status: 400 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)));
    const action = searchParams.get("action")?.trim();
    const targetType = searchParams.get("targetType")?.trim();
    const q = searchParams.get("q")?.trim();

    const filter = {};
    if (action) filter.action = action;
    if (targetType) filter.targetType = targetType;
    if (q) {
      filter.$or = [
        { actorName: { $regex: q, $options: "i" } },
        { actorEmail: { $regex: q, $options: "i" } },
        { targetLabel: { $regex: q, $options: "i" } },
        { action: { $regex: q, $options: "i" } },
      ];
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    return NextResponse.json({
      ok: true,
      logs: logs.map(serializeLog),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err) {
    console.error("GET /api/admin/audit-logs:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
