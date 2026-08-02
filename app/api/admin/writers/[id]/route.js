import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { getAuthUser } from "@/lib/auth";
import { logAdminAction } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req, { params }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ ok: false, error: "Invalid user id." }, { status: 400 });
    }

    const body    = await req.json().catch(() => null);
    const action  = body?.action; // "approve" or "reject"

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ ok: false, error: "Invalid action." }, { status: 400 });
    }

    await dbConnect();

    const update = action === "approve"
      ? {
          "writerVerification.status":     "approved",
          "writerVerification.reviewedAt": new Date(),
          role: "blog_writer",
        }
      : {
          "writerVerification.status":          "rejected",
          "writerVerification.reviewedAt":      new Date(),
          "writerVerification.rejectionReason": body?.reason || "Not approved",
        };

    const user = await User.findByIdAndUpdate(id, update, { new: true });
    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found." }, { status: 404 });
    }

    await logAdminAction({
      req,
      actor: authUser,
      action: action === "approve" ? "writer_application_approved" : "writer_application_rejected",
      targetType: "writer_application",
      targetId: user._id,
      targetLabel: user.email || user.name || "",
      metadata: { status: user.writerVerification?.status || "", legacyEndpoint: true },
    });

    return NextResponse.json({ ok: true, status: user.writerVerification.status });
  } catch (err) {
    console.error("admin/writer-action error:", err.message);
    return NextResponse.json({ ok: false, error: "Action failed." }, { status: 500 });
  }
}
