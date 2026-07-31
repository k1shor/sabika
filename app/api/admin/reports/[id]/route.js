import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { logAdminAction } from "@/lib/audit";
import { Report } from "@/models/Report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ReviewSchema = z.object({
  status: z.enum(["open", "reviewed", "dismissed", "action_taken"]),
  adminNotes: z.string().trim().max(1000).optional(),
});

export async function PATCH(req, { params }) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error || "Forbidden" }, { status: 403 });

    if (!isDbEnabled()) {
      return NextResponse.json({ ok: false, error: "Service unavailable." }, { status: 503 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ ok: false, error: "Invalid report id" }, { status: 400 });
    }

    const body = await req.json().catch(() => null);
    const parsed = ReviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid report update" }, { status: 400 });
    }

    await dbConnect();

    const report = await Report.findByIdAndUpdate(
      id,
      {
        $set: {
          status: parsed.data.status,
          adminNotes: parsed.data.adminNotes || "",
          reviewedBy: auth.user.id,
          reviewedAt: parsed.data.status === "open" ? null : new Date(),
        },
      },
      { new: true }
    ).lean();

    if (!report) {
      return NextResponse.json({ ok: false, error: "Report not found" }, { status: 404 });
    }

    await logAdminAction({
      req,
      actor: auth.user,
      action: "report_reviewed",
      targetType: "report",
      targetId: report._id,
      targetLabel: report.targetLabel || "",
      metadata: {
        reportStatus: report.status,
        reportTargetType: report.targetType,
        reportTargetId: String(report.targetId || ""),
      },
    });

    return NextResponse.json({
      ok: true,
      report: {
        _id: String(report._id),
        status: report.status,
        adminNotes: report.adminNotes || "",
        reviewedAt: report.reviewedAt || null,
      },
    });
  } catch (err) {
    console.error("PATCH /api/admin/reports/[id]:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
