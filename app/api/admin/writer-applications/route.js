import { NextResponse } from "next/server";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { User } from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error || "Forbidden" }, { status: 403 });

  if (!isDbEnabled()) {
    return NextResponse.json({ ok: false, error: "Database is disabled. Enable USE_DB=true" }, { status: 400 });
  }

  await dbConnect();

  const users = await User.find({
    role: "blog_writer",
    "writerVerification.status": { $in: ["pending", "approved", "rejected"] },
  })
    .sort({ "writerVerification.submittedAt": -1, createdAt: -1 })
    .lean();

  return NextResponse.json({ ok: true, applications: users.map(serializeApplication) });
}
