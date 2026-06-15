import { NextResponse } from "next/server";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { User } from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function serializeUser(user) {
  return {
    _id: user._id ? String(user._id) : "",
    name: user.name || "",
    email: user.email || "",
    role: user.role || "visitor",
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
    updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : user.updatedAt,
  };
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error || "Forbidden" }, { status: 403 });

  if (!isDbEnabled()) {
    return NextResponse.json({ ok: false, error: "Database is disabled. Enable USE_DB=true" }, { status: 400 });
  }

  await dbConnect();

  const users = await User.find({}, { passwordHash: 0, passwordResetTokenHash: 0, passwordResetExpiresAt: 0 })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({
    ok: true,
    users: users.map(serializeUser),
    currentUserId: auth.user?.id || null,
  });
}
