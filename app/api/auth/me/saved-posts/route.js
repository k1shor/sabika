import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { SavedPost } from "@/models/SavedPost";

export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return NextResponse.json({ ok: false, error: "Login required" }, { status: 401 });

  await dbConnect();

  const posts = await SavedPost.find({ userId: auth.user.id })
  .populate("postId", "title excerpt slug coverImage category tags isAnonymous publishedAt")
  .sort({ createdAt: -1 })
  .lean();

// filter out any saved posts where postId was deleted
const validPosts = posts.filter((p) => p.postId !== null);

return NextResponse.json({ ok: true, posts: validPosts });
}
export async function POST(req) {
  const auth = await requireUser();
  if (!auth.ok) return NextResponse.json({ ok: false, error: "Login required" }, { status: 401 });

  const { postId } = await req.json().catch(() => ({}));
  if (!postId) return NextResponse.json({ ok: false, error: "postId required" }, { status: 400 });

  await dbConnect();

  await SavedPost.findOneAndUpdate(
    { userId: auth.user.id, postId },
    { userId: auth.user.id, postId },
    { upsert: true, new: true }
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(req) {
  const auth = await requireUser();
  if (!auth.ok) return NextResponse.json({ ok: false, error: "Login required" }, { status: 401 });

  const { postId } = await req.json().catch(() => ({}));
  if (!postId) return NextResponse.json({ ok: false, error: "postId required" }, { status: 400 });

  await dbConnect();

  await SavedPost.findOneAndDelete({ userId: auth.user.id, postId });

  return NextResponse.json({ ok: true });
}