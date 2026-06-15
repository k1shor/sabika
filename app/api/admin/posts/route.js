import { NextResponse } from "next/server";
import { z } from "zod";
import sanitizeHtml from "sanitize-html";
import { dbConnect, isDbEnabled } from "@/lib/db";
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

function cleanHtml(html) {
  return sanitizeHtml(String(html || ""), {
    allowedTags: ["p","br","strong","em","u","s","blockquote","ul","ol","li","h2","h3","h4","a","img","code","pre","hr"],
    allowedAttributes: {
      a:   ["href", "target", "rel"],
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

const CreatePostSchema = z.object({
  title:       z.string().trim().min(3).max(160),
  slug:        optionalString(z.string().min(3).max(200)),
  excerpt:     optionalString(z.string().max(400)),
  coverImage:  optionalString(z.string().url()),
  images:      z.array(z.string().url()).optional(),
  contentHtml: optionalString(z.string().min(10)),
  tags:        z.array(z.string().trim().min(1).max(40)).max(5).optional(),
  readTime:    optionalString(z.string().max(30)),
  category: z.enum(["entrance_pass","nursing_student","working_nurse","abroad_study","abroad_work"]),
  postType: z.enum(["normal","reality_check","hospital_diary","country_pathway"]).default("normal"),
  flair:    z.enum(["","tips","tricks","guidance","clinical_experience","career_journey","workplace_reality","story"]).default(""),
});

export async function GET(req) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  if (!isDbEnabled()) {
    return NextResponse.json({ ok: true, posts: DUMMY_POSTS || [] });
  }

  await dbConnect();

  const { searchParams } = new URL(req.url);
  const page    = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit   = 20;
  const status  = searchParams.get("status");
  const flagged = searchParams.get("flagged");

  const filter = {};
  if (status)           filter.status   = status;
  if (flagged === "true") filter.isFlagged = true;

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .populate("authorId", "name avatarUrl badge")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Post.countDocuments(filter),
  ]);

  return NextResponse.json({
    ok: true,
    posts,
    pagination: { page, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(req) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error || "Forbidden" }, { status: 403 });

  const body   = await req.json().catch(() => null);
  const parsed = CreatePostSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid input", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  if (!isDbEnabled()) {
    return NextResponse.json({ ok: false, error: "Database is disabled." }, { status: 503 });
  }

  await dbConnect();

  const title = parsed.data.title;
  const slug  = slugify(parsed.data.slug || title);
  if (!slug) return NextResponse.json({ ok: false, error: "Invalid slug" }, { status: 400 });

  const exists = await Post.findOne({ slug }).lean();
  if (exists) return NextResponse.json({ ok: false, error: "Slug already exists" }, { status: 409 });

  const post = await Post.create({
    title,
    slug,
    excerpt:        parsed.data.excerpt     || "",
    coverImage:     parsed.data.coverImage  || "",
    images:         parsed.data.images      || [],
    contentHtml:    cleanHtml(parsed.data.contentHtml || ""),
    category:       parsed.data.category,
    postType:       parsed.data.postType    || "normal",
    flair:          parsed.data.flair       || "",
    tags:           parsed.data.tags        || [],
    authorId:       auth.user.id,
    isAnonymous:    false,
    isOfficialPost: true,   // ✅ admin posts = Nursing Nepal
    status:         "approved",
    readTime:       parsed.data.readTime    || "5 min read",
    publishedAt:    new Date(),
  });

  return NextResponse.json({ ok: true, post });
}