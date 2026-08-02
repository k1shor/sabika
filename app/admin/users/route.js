import { NextResponse } from "next/server";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { User } from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeRegex(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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

export async function GET(req) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error || "Forbidden" }, { status: 403 });

    if (!isDbEnabled()) {
      return NextResponse.json({ ok: false, error: "Database is disabled. Enable USE_DB=true" }, { status: 400 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page  = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = 20;
    const q     = searchParams.get("q");

    const filter = {};
    if (q && q.trim()) {
      const pattern = new RegExp(escapeRegex(q.trim()), "i");
      filter.$or = [{ name: pattern }, { email: pattern }, { role: pattern }];
    }

    const [users, total] = await Promise.all([
      User.find(filter, { passwordHash: 0, passwordResetTokenHash: 0, passwordResetExpiresAt: 0 })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return NextResponse.json({
      ok: true,
      users: users.map(serializeUser),
      currentUserId: auth.user?.id || null,
      pagination: { page, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("GET /api/admin/users:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}