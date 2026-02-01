import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect, useDb } from "@/lib/db";
import { Post } from "@/models/Post";
import { requireAdmin } from "@/lib/auth";
import { DUMMY_POSTS } from "@/lib/dummy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const CreatePostSchema = z.object({
  title: z.string().min(3).max(160),
  slug: z.string().optional(),
  excerpt: z.string().max(400).optional(),
  content: z.string().min(10).optional(),
  tags: z.array(z.string()).optional(),
  author: z.string().max(80).optional(),
  readTime: z.string().max(30).optional(),
  publishedAt: z.string().optional(),
});

export async function GET() {
  if (!useDb()) {
    const posts = (DUMMY_POSTS || []).map((p) => ({
      ...p,
      _id: p.slug,
    }));
    return NextResponse.json({ ok: true, posts });
  }

  await dbConnect();

  const posts = await Post.find({})
    .sort({ publishedAt: -1 })
    .lean();

  return NextResponse.json({ ok: true, posts });
}

export async function POST(req) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error || "Unauthorized" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = CreatePostSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
  }

  if (!useDb()) {
    return NextResponse.json(
      { ok: false, error: "Database is disabled. Enable USE_DB=true" },
      { status: 400 }
    );
  }

  await dbConnect();

  const title = parsed.data.title.trim();
  const slug = slugify(parsed.data.slug || title);

  const exists = await Post.findOne({ slug }).lean();
  if (exists) {
    return NextResponse.json({ ok: false, error: "Slug already exists" }, { status: 409 });
  }

  const post = await Post.create({
    title,
    slug,
    excerpt: parsed.data.excerpt ? parsed.data.excerpt.trim() : "",
    content: parsed.data.content ? parsed.data.content.trim() : "",
    tags: Array.isArray(parsed.data.tags) ? parsed.data.tags : [],
    author: parsed.data.author ? parsed.data.author.trim() : "Nursing Nepal",
    readTime: parsed.data.readTime ? parsed.data.readTime.trim() : "5 min read",
    publishedAt: parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : new Date(),
  });

  return NextResponse.json({ ok: true, post });
}
