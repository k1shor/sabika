import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { Report, REPORT_REASON_VALUES } from "@/models/Report";
import { Post } from "@/models/Post";
import { User } from "@/models/User";
import { Notification } from "@/models/Notification";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ReportSchema = z.object({
  targetType: z.enum(["post", "writer"]),
  targetId: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), "Invalid target id"),
  reason: z.enum(REPORT_REASON_VALUES),
  details: z.string().trim().max(1000).optional(),
});

async function findTarget({ targetType, targetId }) {
  if (targetType === "post") {
    const post = await Post.findOne({ _id: targetId, status: "approved" }).lean();
    if (!post) return null;
    return { label: post.title || "", post };
  }

  const writer = await User.findOne({
    _id: targetId,
    role: "blog_writer",
    "writerVerification.status": "approved",
  }).lean();
  if (!writer) return null;
  return { label: writer.name || writer.email || "", writer };
}

export async function POST(req) {
  try {
    const limit = checkRateLimit(req, { name: "report-submit", limit: 8, windowMs: 10 * 60 * 1000 });
    if (!limit.ok) return rateLimitResponse(limit);

    const auth = await requireUser();
    if (!auth.ok) return NextResponse.json({ ok: false, error: "Login required" }, { status: 401 });

    if (!isDbEnabled()) {
      return NextResponse.json({ ok: false, error: "Service unavailable." }, { status: 503 });
    }

    const body = await req.json().catch(() => null);
    const parsed = ReportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid report", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    await dbConnect();

    const target = await findTarget(parsed.data);
    if (!target) {
      return NextResponse.json({ ok: false, error: "Report target not found." }, { status: 404 });
    }

    if (
      (parsed.data.targetType === "post" && String(target.post?.authorId) === String(auth.user.id)) ||
      (parsed.data.targetType === "writer" && String(parsed.data.targetId) === String(auth.user.id))
    ) {
      return NextResponse.json({ ok: false, error: "You cannot report your own content." }, { status: 400 });
    }

    const existing = await Report.findOne({
      reporterId: auth.user.id,
      targetType: parsed.data.targetType,
      targetId: parsed.data.targetId,
    }).lean();

    if (existing) {
      return NextResponse.json({ ok: false, error: "You already reported this item." }, { status: 409 });
    }

    await Report.create({
      reporterId: auth.user.id,
      targetType: parsed.data.targetType,
      targetId: parsed.data.targetId,
      targetLabel: target.label,
      reason: parsed.data.reason,
      details: parsed.data.details?.trim() || "",
    });

    if (parsed.data.targetType === "post") {
      await Post.updateOne(
        { _id: parsed.data.targetId },
        {
          $set: {
            isFlagged: true,
            flaggedReason: `User report: ${parsed.data.reason.replace(/_/g, " ")}`,
          },
        }
      );
    }

    const admins = await User.find({ role: "admin" }, { _id: 1 }).lean();
    if (admins.length > 0) {
      await Notification.insertMany(
        admins.map((admin) => ({
          userId: admin._id,
          actorId: auth.user.id,
          type: parsed.data.targetType === "post" ? "post_flagged" : "system",
          postId: parsed.data.targetType === "post" ? parsed.data.targetId : undefined,
          message: `${auth.user.name || "A user"} reported ${parsed.data.targetType}: ${target.label}`,
          read: false,
        }))
      );
    }

    return NextResponse.json(
      { ok: true, message: "Report submitted. Our admin team will review it." },
      { status: 201 }
    );
  } catch (err) {
    if (err?.code === 11000) {
      return NextResponse.json({ ok: false, error: "You already reported this item." }, { status: 409 });
    }
    console.error("POST /api/reports:", err);
    return NextResponse.json({ ok: false, error: "Failed to submit report" }, { status: 500 });
  }
}
