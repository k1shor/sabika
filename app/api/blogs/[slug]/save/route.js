import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Post } from "@/models/Post";
import { SavedPost } from "@/models/SavedPost";
import { DUMMY_POSTS } from "@/lib/dummy";

export async function POST(_req, { params }) {
  const auth = await requireUser();
  if (!auth.ok) return NextResponse.json({ ok: false, error: "Login required" }, { status: 401 });

  const { slug } = await params;

  await dbConnect();

  const dbPost = await Post.findOne({ slug }).lean();
  const dummyPost = DUMMY_POSTS.find((p) => p.slug === slug);
  const post = dbPost || dummyPost;

  if (!post) return NextResponse.json({ ok: false, error: "Post not found" }, { status: 404 });

  await SavedPost.findOneAndUpdate(
    { userId: auth.user.id, slug },
    {
      userId: auth.user.id,
      postId: dbPost?._id,
      slug,
      title: post.title,
      excerpt: post.excerpt || "",
    },
    { upsert: true }
  );

  return NextResponse.json({ ok: true, message: "Post saved" });
}

export async function DELETE(_req, { params }) {
  const auth = await requireUser();
  if (!auth.ok) return NextResponse.json({ ok: false, error: "Login required" }, { status: 401 });

  const { slug } = await params;

  await dbConnect();
  await SavedPost.deleteOne({ userId: auth.user.id, slug });

  return NextResponse.json({ ok: true, message: "Post removed from saved list" });
}