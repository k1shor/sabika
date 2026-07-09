import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { User } from "@/models/User";
import { Notification } from "@/models/Notification";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function deriveBadge(category) {
  if (category === "nursing_student" || category === "entrance_exam_passed") return "nursing_student";
  if (category === "registered_nurse" || category === "nurse_working_nepal")  return "registered_nurse";
  if (category === "nurse_studying_abroad" || category === "nurse_working_abroad") return "abroad_nurse";
  return "";
}

export async function PATCH(req, { params }) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    if (!isDbEnabled()) {
      return NextResponse.json({ ok: false, error: "Service unavailable." }, { status: 503 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
    }

    const { status, rejectionReason } = body;

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ ok: false, error: "Status must be approved or rejected" }, { status: 400 });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ ok: false, error: "Invalid user id" }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    if (!user.writerVerification) {
      return NextResponse.json({ ok: false, error: "No writer application found" }, { status: 400 });
    }

    // update verification
    user.writerVerification.status       = status;
    user.writerVerification.reviewedAt   = new Date();
    user.writerVerification.rejectionReason = status === "rejected"
      ? (rejectionReason?.trim() || "")
      : "";

    // if approved — set role and badge
    if (status === "approved") {
      user.role  = "blog_writer";
      user.badge = deriveBadge(user.writerVerification.category);
    }

    await user.save();

    // notify the writer
    try {
      await Notification.create({
        userId:  user._id,
        actorId: auth.user.id,
        type:    status === "approved" ? "writer_approved" : "writer_rejected",
        message: status === "approved"
          ? "Your writer application has been approved! You can now publish posts."
          : `Your writer application was rejected.${rejectionReason?.trim() ? ` Reason: ${rejectionReason.trim()}` : ""}`,
      });
    } catch (notifErr) {
      // don't fail the whole request if notification fails
      console.error("Notification failed:", notifErr.message);
    }

    return NextResponse.json({
      ok: true,
      application: {
        _id:   String(user._id),
        name:  user.name,
        email: user.email,
        role:  user.role,
        badge: user.badge,
        writerVerification: {
          status:          user.writerVerification.status,
          category:        user.writerVerification.category,
          licenseNo:       user.writerVerification.licenseNo || "",
          workplace:       user.writerVerification.workplace || "",
          documentUrl:     user.writerVerification.documentUrl || "",
          submittedAt:     user.writerVerification.submittedAt || null,
          reviewedAt:      user.writerVerification.reviewedAt || null,
          rejectionReason: user.writerVerification.rejectionReason || "",
        },
      },
    });
  } catch (err) {
    console.error("PATCH /api/admin/writer-applications/[id]:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}