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
    { name: 1, email: 1, role: 1, writerVerification: 1, createdAt: 1 }
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
      writerStatus: writer.writerVerification?.status || "none",
      followedAt: followedAtByWriter.get(String(writer._id)) || null,
    })),
  });
}
