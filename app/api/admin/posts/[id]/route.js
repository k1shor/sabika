import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect, useDb } from "@/lib/db";
import { Post } from "@/models/Post";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UpdatePostSchema = z.object({
  title: z.string().min(3).max(160).optional(),
  excerpt: z.string().max(400).optional(),
  content: z.string().min(10).optional(),
  tags: z.array(z.string()).optional(),
  author: z.string().max(80).optional(),
  readTime: z.string().max(30).optional(),
  publishedAt: z.string().optional(),
});

export async function PATCH(req, { params }) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error || "Unauthorized" }, { status: 403 });
  }

  if (!useDb()) {
    return NextResponse.json(
      { ok: false, error: "Database is disabled. Enable USE_DB=true" },
      { status: 400 }
    );
  }

  const id = params?.id;
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

  const body = await req.json().catch(() => null);
  const parsed = UpdatePostSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
  }

  await dbConnect();

  const update = {};

  if (parsed.data.title !== undefined) update.title = parsed.data.title.trim();
  if (parsed.data.excerpt !== undefined) update.excerpt = parsed.data.excerpt.trim();
  if (parsed.data.content !== undefined) update.content = parsed.data.content.trim();
  if (parsed.data.author !== undefined) update.author = parsed.data.author.trim();
  if (parsed.data.readTime !== undefined) update.readTime = parsed.data.readTime.trim();
  if (parsed.data.tags !== undefined) update.tags = Array.isArray(parsed.data.tags) ? parsed.data.tags : [];
  if (parsed.data.publishedAt !== undefined) update.publishedAt = new Date(parsed.data.publishedAt);

  const post = await Post.findByIdAndUpdate(id, update, { new: true }).lean();

  if (!post) {
    return NextResponse.json({ ok: false, error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, post });
}

export async function DELETE(_req, { params }) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error || "Unauthorized" }, { status: 403 });
  }

  if (!useDb()) {
    return NextResponse.json(
      { ok: false, error: "Database is disabled. Enable USE_DB=true" },
      { status: 400 }
    );
  }

  const id = params?.id;
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

  await dbConnect();

  const deleted = await Post.findByIdAndDelete(id).lean();
  if (!deleted) {
    return NextResponse.json({ ok: false, error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
