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

// api/admin/posts/[id]/route.js — needs to be created
export async function PATCH(req, { params }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });

  if (!isDbEnabled()) {
    return NextResponse.json({ ok: false, error: "Service unavailable." }, { status: 503 });
  }

  await dbConnect();

  const { id } = await params;

  // build only the fields being updated
  const updateFields = {};

  if (typeof body.isFlagged === "boolean") {
    updateFields.isFlagged    = body.isFlagged;
    updateFields.flaggedReason = body.flaggedReason || "";
  }

  if (body.status && ["approved", "rejected", "pending"].includes(body.status)) {
    updateFields.status = body.status;
    if (body.rejectionReason) {
      updateFields.rejectionReason = body.rejectionReason;
    }
  }

  if (Object.keys(updateFields).length === 0) {
    return NextResponse.json({ ok: false, error: "Nothing to update" }, { status: 400 });
  }

  const post = await Post.findByIdAndUpdate(
    id,
    { $set: updateFields },
    { new: true, runValidators: false } // runValidators false — we only update specific fields
  ).lean();

  if (!post) {
    return NextResponse.json({ ok: false, error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, post });
}

export async function DELETE(_req, context) {
  const auth = await requireAdmin();

  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error || "Forbidden" },
      { status: 403 }
    );
  }

  if (!isDbEnabled()) {
    return NextResponse.json(
      { ok: false, error: "Database is disabled. Enable USE_DB=true" },
      { status: 400 }
    );
  }

  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { ok: false, error: "Missing id" },
      { status: 400 }
    );
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { ok: false, error: "Invalid id" },
      { status: 400 }
    );
  }

  await dbConnect();

  const deleted = await Post.findByIdAndDelete(id).lean();

  if (!deleted) {
    return NextResponse.json(
      { ok: false, error: "Post not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true });
}
