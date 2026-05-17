import { NextResponse } from "next/server";
import { DUMMY_POSTS } from "@/lib/dummy";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { Post } from "@/models/Post";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
