import { NextResponse } from "next/server";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { User } from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  try {
    const { username } = await params;

    if (!username) {
      return NextResponse.json({ ok: false, error: "Username required" }, { status: 400 });
    }

    if (!isDbEnabled()) {
      return NextResponse.json({ ok: false, error: "Service unavailable." }, { status: 503 });
    }

    await dbConnect();

    const user = await User.findOne({ username: username.toLowerCase(), isBanned: false }).lean();

    if (!user) {
      return NextResponse.json({ ok: false, error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      user: {
        name: user.name,
        username: user.username,
        bio: user.bio || "",
        avatarUrl: user.avatarUrl || "",
        twitter: user.twitter || "",
        website: user.website || "",
        role: user.role,
        badge: user.badge || "",
        writerStatus: user.writerVerification?.status || "none",
        stats: {
          totalBlogs: user.stats?.totalBlogs || 0,
          totalFollowers: user.stats?.totalFollowers || 0,
          totalFollowing: user.stats?.totalFollowing || 0,
        },
      },
    });
  } catch (err) {
    console.error("GET /api/profile/[username]:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}