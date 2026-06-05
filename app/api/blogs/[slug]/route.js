import { NextResponse } from "next/server";
import { DUMMY_POSTS } from "@/lib/dummy";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { Post } from "@/models/Post";
import { getAuthUser } from "@/lib/auth"; // ✅ your actual auth, no NextAuth

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(String(slug || "")).trim();

  if (!isDbEnabled()) {
    const post = (DUMMY_POSTS || []).find((p) => p.slug === decodedSlug);
    if (!post) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true, post });
  }

  await dbConnect();

  const post = await Post.findOne({ slug: decodedSlug, status: "approved" })
    .populate("authorId", "name avatarUrl badge username bio")
    .lean();

  if (!post) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  await Post.updateOne({ _id: post._id }, { $inc: { views: 1 } });

  const safePost = {
    ...post,
    authorId: post.isAnonymous ? null : post.authorId,
    authorLabel: post.isAnonymous ? "Anonymous Nurse" : undefined,
  };

  return NextResponse.json({ ok: true, post: safePost });
}

export async function DELETE(_req, { params }) {
  try {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(String(slug || "")).trim();

    if (!isDbEnabled()) {
      return NextResponse.json({ ok: false, error: "Delete not supported in dummy mode" }, { status: 400 });
    }

    await dbConnect();

    const user = await getAuthUser(); // ✅ works for both Google and manual login
    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const post = await Post.findOne({ slug: decodedSlug });
    if (!post) {
      return NextResponse.json({ ok: false, error: "Post not found" }, { status: 404 });
    }

    if (post.authorId.toString() !== String(user._id || user.id)) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    await Post.findByIdAndDelete(post._id);
    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("DELETE /api/blogs/[slug]:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}