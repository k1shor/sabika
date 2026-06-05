import { NextResponse } from "next/server";
import { DUMMY_POSTS } from "@/lib/dummy";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { Post } from "@/models/Post";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  const slug = decodeURIComponent(String(params?.slug || "")).trim();

  if (!isDbEnabled()) {
    const post = (DUMMY_POSTS || []).find((p) => p.slug === slug);
    if (!post) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true, post });
  }

  await dbConnect();

  const post = await Post.findOne({ slug: s, status: "approved" })
    .populate("authorId", "name avatarUrl badge username bio")
    .lean();

  if (!post) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  // increment view count
  await Post.updateOne({ _id: post._id }, { $inc: { views: 1 } });

  // anonymous protection
  const safePost = {
    ...post,
    authorId: post.isAnonymous ? null : post.authorId,
    authorLabel: post.isAnonymous ? "Anonymous Nurse" : undefined,
  };

  return NextResponse.json({ ok: true, post: safePost });
}