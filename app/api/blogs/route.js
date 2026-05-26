import { NextResponse } from "next/server";
import { DUMMY_POSTS } from "@/lib/dummy";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { Post } from "@/models/Post";
import { requireApprovedWriter } from "@/lib/auth";
import { PostCreateSchema } from "@/lib/validators";
import { Follow } from "@/models/Follow";
import { Notification } from "@/models/Notification";

export async function GET() {
  if (!isDbEnabled()) {
    const posts = (DUMMY_POSTS || []).map((p) => ({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      coverImage: p.coverImage || "",
      tags: p.tags || [],
      author: p.author || "Nursing Nepal",
      readTime: p.readTime || "5 min read",
      publishedAt: p.publishedAt || null,
    }));
    return NextResponse.json({ ok: true, posts });
  }

  await dbConnect();

  const posts = await Post.find(
    {},
    { title: 1, slug: 1, excerpt: 1, coverImage: 1, tags: 1, author: 1, readTime: 1, publishedAt: 1, createdAt: 1 }
  )
    .sort({ publishedAt: -1 })
    .lean();

  return NextResponse.json({ ok: true, posts });
}

export async function POST(req) {
  const auth = await requireApprovedWriter();
  if (!auth.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: auth.error || "Unauthorized",
        next: auth.error === "Writer approval required" ? "/apply-writer" : undefined,
      },
      { status: auth.error === "Unauthorized" ? 401 : 403 }
    );
  }

  const body = await req.json();
  const parsed = PostCreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid data" }, { status: 400 });

  if (!isDbEnabled()) {
    return NextResponse.json(
      { ok: false, error: "USE_DB=false" },
      { status: 400 }
    );
  }

  await dbConnect();

  const created = await Post.create({
    ...parsed.data,
    authorId: auth.user.id,
    author: auth.user.name || "Nursing Nepal",
    publishedAt: new Date(),
  });

  const followers = await Follow.find({ writerId: auth.user.id }).lean();

  if (followers.length > 0) {
    await Notification.insertMany(
      followers.map((follow) => ({
        userId: follow.followerId,
        writerId: auth.user.id,
        type: "new_post",
        postSlug: created.slug,
        message: `${auth.user.name || "A writer"} published a new post: ${created.title}`,
        read: false,
      }))
    );
  }

  return NextResponse.json({ ok: true, post: created });
}
