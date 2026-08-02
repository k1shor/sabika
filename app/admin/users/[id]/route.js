import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { User } from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// role and isBanned can each be sent independently (the users panel
// sends only one or the other per action) -- both optional, but at
// least one must be present.
const UserUpdateSchema = z.object({
  role: z.enum(["visitor", "blog_writer", "admin"]).optional(),
  isBanned: z.boolean().optional(),
}).refine((data) => data.role !== undefined || data.isBanned !== undefined, {
  message: "Nothing to update",
});

function serializeUser(user) {
  return {
    _id: user._id ? String(user._id) : "",
    name: user.name || "",
    email: user.email || "",
    role: user.role || "visitor",
    isBanned: Boolean(user.isBanned),
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
    updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : user.updatedAt,
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
  const parsed = UserUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });

  await dbConnect();

  const currentUserId = auth.user?.id ? String(auth.user.id) : "";

  if (id === currentUserId) {
    return NextResponse.json({ ok: false, error: "You cannot modify your own account here" }, { status: 400 });
  }

  const user = await User.findById(id);
  if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

  if (parsed.data.role !== undefined) {
    if (user.role === "admin" && parsed.data.role !== "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return NextResponse.json({ ok: false, error: "At least one admin account is required" }, { status: 400 });
      }
    }
    user.role = parsed.data.role;
  }

  if (parsed.data.isBanned !== undefined) {
    user.isBanned = parsed.data.isBanned;
    user.bannedAt = parsed.data.isBanned ? new Date() : undefined;
  }

  await user.save();

  return NextResponse.json({ ok: true, user: serializeUser(user) });
}