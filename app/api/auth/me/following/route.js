import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Follow } from "@/models/Follow";
import { User } from "@/models/User";

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
  const auth = await requireUser();
  if (!auth.ok) return NextResponse.json({ ok: false, error: "Login required" }, { status: 401 });

  const { writerId } = await req.json().catch(() => ({}));
  if (!writerId) return NextResponse.json({ ok: false, error: "writerId required" }, { status: 400 });

  await dbConnect();

  // can't follow yourself
  if (String(auth.user.id) === String(writerId)) {
    return NextResponse.json({ ok: false, error: "Cannot follow yourself" }, { status: 400 });
  }

  await Follow.findOneAndUpdate(
    { followerId: auth.user.id, writerId },
    { followerId: auth.user.id, writerId },
    { upsert: true, new: true }
  );

  // update writer's follower count
  await User.findByIdAndUpdate(writerId, { $inc: { "stats.totalFollowers": 1 } });
  // update current user's following count
  await User.findByIdAndUpdate(auth.user.id, { $inc: { "stats.totalFollowing": 1 } });

  // notify the writer
  await Notification.create({
    userId: writerId,
    actorId: auth.user.id,
    type: "new_follower",
    message: `${auth.user.name} started following you.`,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req) {
  const auth = await requireUser();
  if (!auth.ok) return NextResponse.json({ ok: false, error: "Login required" }, { status: 401 });

  const { writerId } = await req.json().catch(() => ({}));
  if (!writerId) return NextResponse.json({ ok: false, error: "writerId required" }, { status: 400 });

  await dbConnect();

  await Follow.findOneAndDelete({ followerId: auth.user.id, writerId });

  // decrement counts
  await User.findByIdAndUpdate(writerId, { $inc: { "stats.totalFollowers": -1 } });
  await User.findByIdAndUpdate(auth.user.id, { $inc: { "stats.totalFollowing": -1 } });

  return NextResponse.json({ ok: true });
}