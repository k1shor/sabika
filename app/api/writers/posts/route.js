import { NextResponse } from "next/server";
import { z } from "zod";
import sanitizeHtml from "sanitize-html";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { requireApprovedWriter } from "@/lib/auth";
import { Post } from "@/models/Post";
import { Follow } from "@/models/Follow";
import { Notification } from "@/models/Notification";
import { User } from "@/models/User";

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
  title:       z.string().trim().min(3, "Title must be at least 3 characters").max(160, "Title is too long"),
  slug:        optionalString(z.string().min(3).max(200)),
  // FIX: excerpt is now required with a minimum length
  excerpt:     z.string().trim().min(10, "Excerpt must be at least 10 characters").max(400, "Excerpt is too long"),
  coverImage:  OptionalUrlSchema,
  images:      z.array(z.string().url()).optional(),
  // FIX: contentHtml is now required with a minimum length
  contentHtml: z.string().trim().min(10, "Post content is required"),
  tags: z.array(z.string().trim().max(40)).min(0).optional().default([]),
  readTime:    optionalString(z.string().max(30)),
  category:    z.enum(
    ["entrance_pass", "nursing_student", "working_nurse", "abroad_study", "abroad_work"],
    { errorMap: () => ({ message: "Please select a valid category" }) }
  ),
  postType:    z.enum(["normal", "reality_check", "hospital_diary", "country_pathway"]).default("normal"),
  isAnonymous: z.boolean().default(false),
});

function serializePost(post) {
  return {
    _id:         String(post._id),
    title:       post.title || "",
    slug:        post.slug || "",
    excerpt:     post.excerpt || "",
    coverImage:  post.coverImage || "",
    tags:        post.tags || [],
    author:      post.author || "",
    readTime:    post.readTime || "",
    publishedAt: post.publishedAt instanceof Date ? post.publishedAt.toISOString() : post.publishedAt,
    createdAt:   post.createdAt instanceof Date ? post.createdAt.toISOString() : post.createdAt,
  };
}

export async function GET() {
  const auth = await requireApprovedWriter();
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error || "Forbidden" },
      { status: auth.error === "Unauthorized" ? 401 : 403 }
    );
  }

  if (!isDbEnabled()) {
    return NextResponse.json({ ok: false, error: "Database is disabled. Enable USE_DB=true" }, { status: 400 });
  }

  await dbConnect();

  const [posts, followerCount] = await Promise.all([
    Post.find({ authorId: auth.user.id }).sort({ publishedAt: -1 }).lean(),
    Follow.countDocuments({ writerId: auth.user.id }),
  ]);

  return NextResponse.json({ ok: true, posts: posts.map(serializePost), followerCount });
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
  if (!body) {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  const parsed = WriterPostSchema.safeParse(body);
  if (!parsed.success) {
    const errors = parsed.error.flatten();
    console.log("Validation errors:", errors);
    return NextResponse.json(
      {
        ok: false,
        error: "Please fix the highlighted fields.",
        fieldErrors: errors.fieldErrors,
        formErrors: errors.formErrors,
      },
      { status: 400 }
    );
  }

  await dbConnect();

  const slug = slugify(parsed.data.slug || parsed.data.title);
  if (!slug) {
    return NextResponse.json({ ok: false, error: "Could not generate a valid slug from the title." }, { status: 400 });
  }

  const exists = await Post.findOne({ slug }).lean();
  if (exists) {
    return NextResponse.json(
      {
        ok: false,
        error: "A post with this slug already exists. Try a different title or set a custom slug.",
        fieldErrors: { slug: ["This slug is already taken"] },
      },
      { status: 409 }
    );
  }

  // FIX: sanitize AFTER validation so we don't accidentally empty valid content
  const sanitizedHtml = cleanHtml(parsed.data.contentHtml);
  if (!sanitizedHtml || sanitizedHtml.trim().length < 10) {
    return NextResponse.json(
      {
        ok: false,
        error: "Post content was stripped during sanitization. Please avoid unsupported HTML.",
        fieldErrors: { contentHtml: ["Post content is invalid or too short after sanitization"] },
      },
      { status: 400 }
    );
  }

  try {
    const post = await Post.create({
      title:       parsed.data.title,
      slug,
      excerpt:     parsed.data.excerpt,
      coverImage:  parsed.data.coverImage || "",
      images:      Array.isArray(parsed.data.images) ? parsed.data.images : [],
      contentHtml: sanitizedHtml,
      tags:        Array.isArray(parsed.data.tags) ? parsed.data.tags : [],
      author:      auth.user.name || "Nursing Nepal Writer",
      authorId:    auth.user.id,
      readTime:    parsed.data.readTime || "5 min read",
      publishedAt: new Date(),
      category:    parsed.data.category,
      postType:    parsed.data.postType || "normal",
      isAnonymous: parsed.data.isAnonymous || false,
    });

    const [followers, admins] = await Promise.all([
      Follow.find({ writerId: auth.user.id }).lean(),
      User.find({ role: "admin" }, { _id: 1 }).lean(),
    ]);

    const notifications = [
      ...followers.map((follow) => ({
        userId:   follow.followerId,
        writerId: auth.user.id,
        type:     "new_post",
        postSlug: post.slug,
        message:  `${auth.user.name || "A writer"} published a new post: ${post.title}`,
        read:     false,
      })),
      ...admins
        .filter((admin) => String(admin._id) !== String(auth.user.id))
        .map((admin) => ({
          userId:   admin._id,
          writerId: auth.user.id,
          type:     "new_post",
          postSlug: post.slug,
          message:  `${auth.user.name || "A writer"} published a new post: ${post.title}`,
          read:     false,
        })),
    ];

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    return NextResponse.json({ ok: true, post: serializePost(post), followerCount: followers.length });

  } catch (err) {
    console.error("Post.create error:", err);

    // Mongoose validation error — map to fieldErrors
    if (err.name === "ValidationError") {
      const fieldErrors = {};
      for (const [key, val] of Object.entries(err.errors)) {
        fieldErrors[key] = [val.message];
      }
      return NextResponse.json(
        { ok: false, error: "Please fix the highlighted fields.", fieldErrors },
        { status: 400 }
      );
    }

    // Duplicate key (unique index) — e.g. slug
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0] || "slug";
      return NextResponse.json(
        {
          ok: false,
          error: "A post with this slug already exists.",
          fieldErrors: { [field]: [`This ${field} is already taken`] },
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { ok: false, error: err.message || "Failed to create post. Please try again." },
      { status: 500 }
    );
  }
}