import { NextResponse } from "next/server";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Report } from "@/models/Report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function serializeReport(report) {
  return {
    _id: String(report._id),
    reporterId: report.reporterId?._id ? String(report.reporterId._id) : String(report.reporterId || ""),
    reporterName: report.reporterId?.name || "",
    reporterEmail: report.reporterId?.email || "",
    targetType: report.targetType || "",
    targetId: report.targetId ? String(report.targetId) : "",
    targetLabel: report.targetLabel || "",
    reason: report.reason || "",
    details: report.details || "",
    status: report.status || "open",
    adminNotes: report.adminNotes || "",
    reviewedAt: report.reviewedAt instanceof Date ? report.reviewedAt.toISOString() : report.reviewedAt,
    createdAt: report.createdAt instanceof Date ? report.createdAt.toISOString() : report.createdAt,
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
    const status = searchParams.get("status")?.trim();
    const targetType = searchParams.get("targetType")?.trim();

    const filter = {};
    if (status) filter.status = status;
    if (targetType) filter.targetType = targetType;

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .populate("reporterId", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Report.countDocuments(filter),
    ]);

    return NextResponse.json({
      ok: true,
      reports: reports.map(serializeReport),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err) {
    console.error("GET /api/admin/reports:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
