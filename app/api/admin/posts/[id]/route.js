import { NextResponse } from "next/server";
import { z } from "zod";
import sanitizeHtml from "sanitize-html";
import mongoose from "mongoose";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { Post } from "@/models/Post";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cleanHtml(html) {
  return sanitizeHtml(String(html || ""), {
    allowedTags: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "blockquote",
      "ul",
      "ol",
      "li",
      "h2",
      "h3",
      "h4",
      "a",
      "img",
      "code",
      "pre",
      "hr",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "nofollow noopener noreferrer", target: "_blank" }),
    },
  });
}

function optionalString(schema) {
  return z.preprocess((value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }, schema.optional());
}

const OptionalUrlSchema = optionalString(z.string().url());
const OptionalDateSchema = optionalString(
  z.string().refine((value) => !Number.isNaN(new Date(value).getTime()), "Invalid date")
);

const UpdatePostSchema = z.object({
  title: optionalString(z.string().min(3).max(160)),
  excerpt: optionalString(z.string().max(400)),
  coverImage: OptionalUrlSchema,
  images: z.array(z.string().url()).optional(),
  contentHtml: optionalString(z.string().min(10)),
  tags: z.array(z.string().trim().min(1).max(40)).optional(),
  author: optionalString(z.string().max(80)),
  readTime: optionalString(z.string().max(30)),
  publishedAt: OptionalDateSchema,
});

export async function PATCH(req, { params }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error || "Forbidden" }, { status: 403 });

  if (!isDbEnabled()) {
    return NextResponse.json({ ok: false, error: "Database is disabled. Enable USE_DB=true" }, { status: 400 });
  }

  const id = params?.id;
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const parsed = UpdatePostSchema.safeParse(body);

  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });

  await dbConnect();

  const update = {};

  if (parsed.data.title !== undefined) update.title = parsed.data.title;
  if (parsed.data.excerpt !== undefined) update.excerpt = parsed.data.excerpt;
  if (parsed.data.coverImage !== undefined) update.coverImage = parsed.data.coverImage;
  if (parsed.data.images !== undefined) update.images = Array.isArray(parsed.data.images) ? parsed.data.images : [];
  if (parsed.data.contentHtml !== undefined) update.contentHtml = cleanHtml(parsed.data.contentHtml);
  if (parsed.data.author !== undefined) update.author = parsed.data.author;
  if (parsed.data.readTime !== undefined) update.readTime = parsed.data.readTime;
  if (parsed.data.tags !== undefined) update.tags = Array.isArray(parsed.data.tags) ? parsed.data.tags : [];
  if (parsed.data.publishedAt !== undefined) update.publishedAt = new Date(parsed.data.publishedAt);

  const post = await Post.findByIdAndUpdate(id, update, { new: true }).lean();
  if (!post) return NextResponse.json({ ok: false, error: "Post not found" }, { status: 404 });

  return NextResponse.json({ ok: true, post });
}

export async function DELETE(_req, { params }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error || "Forbidden" }, { status: 403 });

  if (!isDbEnabled()) {
    return NextResponse.json({ ok: false, error: "Database is disabled. Enable USE_DB=true" }, { status: 400 });
  }

  const id = params?.id;
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
  }

  await dbConnect();

  const deleted = await Post.findByIdAndDelete(id).lean();
  if (!deleted) return NextResponse.json({ ok: false, error: "Post not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
