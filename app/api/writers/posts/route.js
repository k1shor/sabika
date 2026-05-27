import { NextResponse } from "next/server";
import { z } from "zod";
import sanitizeHtml from "sanitize-html";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { requireApprovedWriter } from "@/lib/auth";
import { Post } from "@/models/Post";
import { Follow } from "@/models/Follow";
import { Notification } from "@/models/Notification";

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

function cleanHtml(html) {
  return sanitizeHtml(String(html || ""), {
    allowedTags: ["p", "br", "strong", "em", "u", "s", "blockquote", "ul", "ol", "li", "h2", "h3", "h4", "a", "img", "code", "pre", "hr"],
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

const WriterPostSchema = z.object({
  title: z.string().trim().min(3).max(160),
  slug: optionalString(z.string().min(3).max(200)),
  excerpt: optionalString(z.string().max(400)),
  coverImage: OptionalUrlSchema,
  images: z.array(z.string().url()).optional(),
  contentHtml: optionalString(z.string().min(10)),
  tags: z.array(z.string().trim().min(1).max(40)).optional(),
  readTime: optionalString(z.string().max(30)),
});

function serializePost(post) {
  return {
    _id: String(post._id),
    title: post.title || "",
    slug: post.slug || "",
    excerpt: post.excerpt || "",
    coverImage: post.coverImage || "",
    tags: post.tags || [],
    author: post.author || "",
    readTime: post.readTime || "",
    publishedAt: post.publishedAt instanceof Date ? post.publishedAt.toISOString() : post.publishedAt,
    createdAt: post.createdAt instanceof Date ? post.createdAt.toISOString() : post.createdAt,
  };
}

export async function GET() {
  const auth = await requireApprovedWriter();
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error || "Forbidden" }, { status: auth.error === "Unauthorized" ? 401 : 403 });
  }

  if (!isDbEnabled()) {
    return NextResponse.json({ ok: false, error: "Database is disabled. Enable USE_DB=true" }, { status: 400 });
  }

  await dbConnect();

  const posts = await Post.find({ authorId: auth.user.id }).sort({ publishedAt: -1 }).lean();

  return NextResponse.json({ ok: true, posts: posts.map(serializePost) });
}

export async function POST(req) {
  const auth = await requireApprovedWriter();
  if (!auth.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: auth.error || "Forbidden",
        next: auth.error === "Writer approval required" ? "/apply-writer" : undefined,
      },
      { status: auth.error === "Unauthorized" ? 401 : 403 }
    );
  }

  if (!isDbEnabled()) {
    return NextResponse.json({ ok: false, error: "Database is disabled. Enable USE_DB=true" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const parsed = WriterPostSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid post input" }, { status: 400 });

  await dbConnect();

  const slug = slugify(parsed.data.slug || parsed.data.title);
  if (!slug) return NextResponse.json({ ok: false, error: "Invalid slug" }, { status: 400 });

  const exists = await Post.findOne({ slug }).lean();
  if (exists) return NextResponse.json({ ok: false, error: "Slug already exists" }, { status: 409 });

  const post = await Post.create({
    title: parsed.data.title,
    slug,
    excerpt: parsed.data.excerpt || "",
    coverImage: parsed.data.coverImage || "",
    images: Array.isArray(parsed.data.images) ? parsed.data.images : [],
    contentHtml: cleanHtml(parsed.data.contentHtml || ""),
    tags: Array.isArray(parsed.data.tags) ? parsed.data.tags : [],
    author: auth.user.name || "Nursing Nepal Writer",
    authorId: auth.user.id,
    readTime: parsed.data.readTime || "5 min read",
    publishedAt: new Date(),
  });

  const followers = await Follow.find({ writerId: auth.user.id }).lean();
  if (followers.length > 0) {
    await Notification.insertMany(
      followers.map((follow) => ({
        userId: follow.followerId,
        writerId: auth.user.id,
        type: "new_post",
        postSlug: post.slug,
        message: `${auth.user.name || "A writer"} published a new post: ${post.title}`,
        read: false,
      }))
    );
  }

  return NextResponse.json({ ok: true, post: serializePost(post) });
}
