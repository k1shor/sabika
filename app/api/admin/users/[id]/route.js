import { NextResponse } from "next/server";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { User } from "@/models/User";

export async function PATCH(req, { params }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  if (!isDbEnabled()) {
    return NextResponse.json({ ok: false, error: "Service unavailable." }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });

  const { id } = await params; // ✅ await params

  await dbConnect();

  const user = await User.findByIdAndUpdate(  // ✅ use findByIdAndUpdate to avoid validation issues
    id,
    (() => {
      const fields = {};

      // prevent admin demoting themselves
      if (body.role && ["visitor", "blog_writer", "admin"].includes(body.role)) {
        fields.role    = body.role;
        fields.isAdmin = body.role === "admin";
      }

      if (typeof body.isBanned === "boolean") {
        fields.isBanned    = body.isBanned;
        fields.bannedAt    = body.isBanned ? new Date() : null;
        fields.bannedReason = body.bannedReason || "";
      }

      return { $set: fields };
    })(),
    { new: true, runValidators: false }
  ).lean();

  if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

  // prevent admin demoting themselves
  if (String(user._id) === String(auth.user.id) && body.role && body.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Cannot change your own role." }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    user: {
      _id:      String(user._id),
      name:     user.name,
      email:    user.email,
      role:     user.role,
      isBanned: user.isBanned || false,
      bannedAt: user.bannedAt || null,
    },
  });
}