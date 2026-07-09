import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Follow } from "@/models/Follow";
import { User } from "@/models/User";
import { Notification } from "@/models/Notification";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: "Login required" }, { status: 401 });
  }

  await dbConnect();

  const follows = await Follow.find({ followerId: auth.user.id }).sort({ createdAt: -1 }).lean();
  const writerIds = follows.map((follow) => follow.writerId);

  const writers = await User.find(
    { _id: { $in: writerIds } },
    { name: 1, email: 1, role: 1, writerVerification: 1,
      createdAt: 1, avatarUrl: 1, badge: 1, username: 1, stats: 1 }
  ).lean();

  const followedAtByWriter = new Map(
    follows.map((follow) => [String(follow.writerId), follow.createdAt])
  );

  return NextResponse.json({
    ok: true,
    writers: writers.map((writer) => ({
      _id: String(writer._id),
      name: writer.name || "",
      email: writer.email || "",
      role: writer.role || "visitor",
      avatarUrl: writer.avatarUrl || "",
      badge: writer.badge || "",
      username: writer.username || null,
      stats: writer.stats || {},
      writerStatus: writer.writerVerification?.status || "none",
      followedAt: followedAtByWriter.get(String(writer._id)) || null,
    })),
  });
}

export async function POST(req) {
  try {
    const auth = await requireUser();
    if (!auth.ok) return NextResponse.json({ ok: false, error: "Login required" }, { status: 401 });

    const { writerId } = await req.json().catch(() => ({}));
    if (!writerId) return NextResponse.json({ ok: false, error: "writerId required" }, { status: 400 });

    if (String(auth.user.id) === String(writerId)) {
      return NextResponse.json({ ok: false, error: "Cannot follow yourself" }, { status: 400 });
    }

    await dbConnect();

    // Check first -- upsert alone would silently no-op on a repeat
    // follow, but the counter increments below would still fire every
    // time, inflating stats.totalFollowers/totalFollowing on repeat
    // calls even when no new Follow relationship was actually created.
    const existing = await Follow.findOne({ followerId: auth.user.id, writerId }).lean();

    if (!existing) {
      await Follow.create({ followerId: auth.user.id, writerId });

      await Promise.all([
        User.findByIdAndUpdate(writerId, { $inc: { "stats.totalFollowers": 1 } }),
        User.findByIdAndUpdate(auth.user.id, { $inc: { "stats.totalFollowing": 1 } }),
        Notification.create({
          userId: writerId,
          actorId: auth.user.id,
          type: "new_follower",
          message: `${auth.user.name || "Someone"} started following you.`,
          read: false,
        }),
      ]);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/auth/me/following:", err);
    return NextResponse.json({ ok: false, error: "Failed to follow writer" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const auth = await requireUser();
    if (!auth.ok) return NextResponse.json({ ok: false, error: "Login required" }, { status: 401 });

    const { writerId } = await req.json().catch(() => ({}));
    if (!writerId) return NextResponse.json({ ok: false, error: "writerId required" }, { status: 400 });

    await dbConnect();

    const deleted = await Follow.findOneAndDelete({ followerId: auth.user.id, writerId });

    // Only decrement -- and only down to 0, never negative -- if a
    // Follow document actually existed to delete. A double-unfollow
    // call (e.g. a double-click) would otherwise drive the cached
    // counters below zero.
    if (deleted) {
      await Promise.all([
        User.updateOne(
          { _id: writerId, "stats.totalFollowers": { $gt: 0 } },
          { $inc: { "stats.totalFollowers": -1 } }
        ),
        User.updateOne(
          { _id: auth.user.id, "stats.totalFollowing": { $gt: 0 } },
          { $inc: { "stats.totalFollowing": -1 } }
        ),
      ]);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/auth/me/following:", err);
    return NextResponse.json({ ok: false, error: "Failed to unfollow writer" }, { status: 500 });
  }
}