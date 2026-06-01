import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { User } from "@/models/User";
import { Follow } from "@/models/Follow";

async function followerState(userId, writerId) {
  const [followerCount, follow] = await Promise.all([
    Follow.countDocuments({ writerId }),
    userId ? Follow.findOne({ followerId: userId, writerId }).lean() : null,
  ]);

  return { followerCount, following: Boolean(follow) };
}

export async function GET(_req, { params }) {
  const auth = await requireUser();
  const { id } = await params;

  await dbConnect();

  const state = await followerState(auth.ok ? auth.user.id : null, id);
  return NextResponse.json({ ok: true, ...state });
}

export async function POST(_req, { params }) {
  const auth = await requireUser();
  if (!auth.ok) return NextResponse.json({ ok: false, error: "Login required" }, { status: 401 });

  const { id } = await params;

  if (String(auth.user.id) === String(id)) {
    return NextResponse.json({ ok: false, error: "You cannot follow yourself" }, { status: 400 });
  }

  await dbConnect();

  const writer = await User.findOne({
    _id: id,
    role: "blog_writer",
    "writerVerification.status": "approved",
  });

  if (!writer) {
    return NextResponse.json({ ok: false, error: "Writer not found" }, { status: 404 });
  }

  await Follow.findOneAndUpdate(
    { followerId: auth.user.id, writerId: id },
    { followerId: auth.user.id, writerId: id },
    { upsert: true }
  );

  const state = await followerState(auth.user.id, id);

  return NextResponse.json({ ok: true, message: "Writer followed", ...state });
}

export async function DELETE(_req, { params }) {
  const auth = await requireUser();
  if (!auth.ok) return NextResponse.json({ ok: false, error: "Login required" }, { status: 401 });

  const { id } = await params;

  await dbConnect();
  await Follow.deleteOne({ followerId: auth.user.id, writerId: id });

  const state = await followerState(auth.user.id, id);

  return NextResponse.json({ ok: true, message: "Writer unfollowed", ...state });
}
