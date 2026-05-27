import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { User } from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ReviewSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  rejectionReason: z.string().trim().max(500).optional(),
});

function serializeApplication(user) {
  return {
    _id: String(user._id),
    name: user.name || "",
    email: user.email || "",
    role: user.role || "visitor",
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
  if (user.role !== "blog_writer") {
    return NextResponse.json({ ok: false, error: "Only blog writer accounts can be reviewed" }, { status: 400 });
  }

  user.writerVerification = {
    ...(user.writerVerification?.toObject?.() || user.writerVerification || {}),
    status: parsed.data.status,
    reviewedAt: new Date(),
    rejectionReason: parsed.data.status === "rejected" ? parsed.data.rejectionReason || "Application rejected by admin." : undefined,
  };

  await user.save();

  return NextResponse.json({ ok: true, application: serializeApplication(user) });
}
