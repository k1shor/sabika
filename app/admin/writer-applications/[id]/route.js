import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { logAdminAction } from "@/lib/audit";
import { User } from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ReviewSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  rejectionReason: z.string().trim().max(500).optional(),
});

function deriveBadge(category) {
  if (category === "nursing_student" || category === "entrance_exam_passed") return "nursing_student";
  if (category === "registered_nurse" || category === "nurse_working_nepal") return "registered_nurse";
  if (category === "nurse_studying_abroad" || category === "nurse_working_abroad") return "abroad_nurse";
  return "";
}

function serializeApplication(user) {
  return {
    _id: String(user._id),
    name: user.name || "",
    email: user.email || "",
    role: user.role || "visitor",
    badge: user.badge || "",
    writerVerification: {
      status: user.writerVerification?.status || "none",
      category: user.writerVerification?.category || "",
      licenseNo: user.writerVerification?.licenseNo || "",
      workplace: user.writerVerification?.workplace || "",
      documentUrl: user.writerVerification?.documentUrl || "",
      submittedAt: user.writerVerification?.submittedAt || null,
      reviewedAt: user.writerVerification?.reviewedAt || null,
      rejectionReason: user.writerVerification?.rejectionReason || "",
    },
  };
}

export async function PATCH(req, { params }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error || "Forbidden" }, { status: 403 });

  if (!isDbEnabled()) {
    return NextResponse.json({ ok: false, error: "Database is disabled. Enable USE_DB=true" }, { status: 400 });
  }

  const { id } = await params;
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const parsed = ReviewSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid review input" }, { status: 400 });

  await dbConnect();

  const user = await User.findById(id);
  if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

  // NOTE: do NOT gate on user.role here. An applicant is "visitor" at
  // the time they apply -- role only becomes "blog_writer" as a RESULT
  // of approval below. Requiring role === "blog_writer" before allowing
  // a review makes it impossible to ever approve a first-time
  // applicant (this exact bug was already found and fixed once before
  // in api/auth/apply-writer/route.js -- don't reintroduce it here).
  if (!user.writerVerification || user.writerVerification.status === "none") {
    return NextResponse.json({ ok: false, error: "No writer application found for this user" }, { status: 400 });
  }

  user.writerVerification = {
    ...(user.writerVerification?.toObject?.() || user.writerVerification || {}),
    status: parsed.data.status,
    reviewedAt: new Date(),
    rejectionReason: parsed.data.status === "rejected" ? parsed.data.rejectionReason || "Application rejected by admin." : undefined,
  };

  // Approval must actually grant the role and badge -- the previous
  // version of this route updated writerVerification.status but never
  // touched user.role or user.badge at all, so an "approved" applicant
  // stayed a visitor forever with no way to publish anything, while the
  // API response claimed otherwise.
  if (parsed.data.status === "approved") {
    user.role = "blog_writer";
    user.badge = deriveBadge(user.writerVerification.category);
  }

  await user.save();

  await logAdminAction({
    req,
    actor: auth.user,
    action: parsed.data.status === "approved" ? "writer_application_approved" : "writer_application_rejected",
    targetType: "writer_application",
    targetId: user._id,
    targetLabel: user.email || user.name || "",
    metadata: {
      status: parsed.data.status,
      category: user.writerVerification?.category || "",
      hasRejectionReason: Boolean(user.writerVerification?.rejectionReason),
    },
  });

  return NextResponse.json({ ok: true, application: serializeApplication(user) });
}