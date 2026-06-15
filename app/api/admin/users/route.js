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
    avatarUrl: user.avatarUrl || "",
    badge: user.badge || "",
    isBanned: Boolean(user.isBanned),
    bannedAt: user.bannedAt || null,
    bannedReason: user.bannedReason || "",
    isVerified: Boolean(user.isVerified),
    writerVerification: {
      status: user.writerVerification?.status || "none",
    },
    stats: user.stats || { totalBlogs: 0, totalFollowers: 0, totalFollowing: 0 },
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
    updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : user.updatedAt,
  };
}

export async function GET(req) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error || "Forbidden" }, { status: 403 });

  if (!isDbEnabled()) {
    return NextResponse.json({ ok: false, error: "Database is disabled. Enable USE_DB=true" }, { status: 400 });
  }

  await dbConnect();

  const url = new URL(req.url);
  const q     = url.searchParams.get("q")?.trim();
  const page  = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = 50;
  const skip  = (page - 1) * limit;

  const filter = q
    ? {
        $or: [
          { name:  { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } },
          { role:  { $regex: q, $options: "i" } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    User.find(filter, { passwordHash: 0, passwordResetTokenHash: 0, passwordResetExpiresAt: 0 })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  return NextResponse.json({
    ok: true,
    users: users.map(serializeUser),
    currentUserId: auth.user?.id || null,
    pagination: {
      page,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}