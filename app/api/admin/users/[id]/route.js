import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { logAdminAction } from "@/lib/audit";
import { User } from "@/models/User";
import { Notification } from "@/models/Notification";

export async function PATCH(req, { params }) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

    if (!isDbEnabled()) {
      return NextResponse.json({ ok: false, error: "Service unavailable." }, { status: 503 });
    }

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ ok: false, error: "Invalid user id" }, { status: 400 });
    }

    await dbConnect();

    if (String(id) === String(auth.user.id) && body.role && body.role !== "admin") {
      return NextResponse.json({ ok: false, error: "Cannot change your own role." }, { status: 400 });
    }

    const existingUser = await User.findById(id).lean();
    if (!existingUser) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    const oldRole = existingUser.role;
    const fields = {};

    if (body.role && ["visitor", "blog_writer", "admin"].includes(body.role)) {
      fields.role = body.role;
      fields.isAdmin = body.role === "admin";
    }

    if (typeof body.isBanned === "boolean") {
      fields.isBanned = body.isBanned;
      fields.bannedAt = body.isBanned ? new Date() : null;
      fields.bannedReason = body.bannedReason || "";
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: fields },
      { new: true, runValidators: false }
    ).lean();

    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    if (body.role && body.role !== oldRole) {
      try {
        await Notification.create({
          userId: user._id,
          actorId: auth.user.id,
          type: "system",
          message: `Your account role has been updated to ${body.role}.`,
        });
      } catch (err) {
        console.error("Notification failed:", err.message);
      }
    }

    if (typeof body.isBanned === "boolean" && body.isBanned !== existingUser.isBanned) {
      try {
        await Notification.create({
          userId: user._id,
          actorId: auth.user.id,
          type: "system",
          message: body.isBanned
            ? "Your account has been suspended. Contact support for more information."
            : "Your account suspension has been lifted. Welcome back!",
        });
      } catch (err) {
        console.error("Ban notification failed:", err.message);
      }
    }

    await logAdminAction({
      req,
      actor: auth.user,
      action: "admin_user_updated",
      targetType: "user",
      targetId: user._id,
      targetLabel: user.email || user.name || "",
      metadata: {
        oldRole,
        newRole: user.role,
        roleChanged: Boolean(body.role && body.role !== oldRole),
        banChanged: typeof body.isBanned === "boolean" && body.isBanned !== existingUser.isBanned,
        isBanned: Boolean(user.isBanned),
      },
    });

    return NextResponse.json({
      ok: true,
      user: {
        _id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        isBanned: user.isBanned || false,
        bannedAt: user.bannedAt || null,
      },
    });
  } catch (err) {
    console.error("PATCH /api/admin/users/[id]:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
