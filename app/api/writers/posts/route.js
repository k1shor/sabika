import { NextResponse } from "next/server";
import { z } from "zod";
import sanitizeHtml from "sanitize-html";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { requireApprovedWriter } from "@/lib/auth";
import { Post } from "@/models/Post";
import { Follow } from "@/models/Follow";
import { Notification } from "@/models/Notification";
import { User } from "@/models/User";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";

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

const OptionalUrlSchema = optionalString(z.string().refine(val => val.startsWith('http') || val.startsWith('/'), "Must be a valid URL or local path"));

const WriterPostSchema = z.object({
  title:       z.string().trim().min(3, "Title must be at least 3 characters").max(160, "Title is too long"),
  slug:        optionalString(z.string().min(3).max(200)),
  excerpt:     z.string().trim().min(10, "Excerpt must be at least 10 characters").max(400, "Excerpt is too long"),
  coverImage:  OptionalUrlSchema,
  images:      z.array(z.string().refine(val => val.startsWith('http') || val.startsWith('/'), "Must be a valid URL or local path")).optional(),
  contentHtml: z.string().trim().min(10, "Post content is required"),
  tags:        z.array(z.string().trim().max(40)).min(0).optional().default([]),
  readTime:    optionalString(z.string().max(30)),
  category:    z.enum(
    ["entrance_pass", "nursing_student", "working_nurse", "abroad_study", "abroad_work"],
    { errorMap: () => ({ message: "Please select a valid category" }) }
  ),
  postType:    z.enum(["normal", "reality_check", "hospital_diary", "country_pathway"]).default("normal"),
  flair:       z.enum(["", "tips", "tricks", "guidance", "clinical_experience", "career_journey", "workplace_reality", "story"]).default(""),
  isAnonymous: z.boolean().default(false),
  saveAsDraft: z.boolean().default(false),
});

function serializePost(post) {
  return {
    _id:         String(post._id),
    title:       post.title || "",
    slug:        post.slug || "",
    excerpt:     post.excerpt || "",
    coverImage:  post.coverImage || "",
    tags:        post.tags || [],
    status:      post.status || "pending",
    readTime:    post.readTime || "",
    publishedAt: post.publishedAt instanceof Date ? post.publishedAt.toISOString() : post.publishedAt,
    createdAt:   post.createdAt instanceof Date ? post.createdAt.toISOString() : post.createdAt,
  };
}

function getWriterBlockReason(user) {
  if (!user) return { code: "UNAUTHORIZED", status: 401 };

  const vs = user.writerVerification?.status;

  if (user.role !== "blog_writer") {
    return { code: "NOT_APPLIED", status: 403 };
  }
  if (vs === "pending") {
    return { code: "APPROVAL_PENDING", status: 403 };
  }
  if (vs === "rejected") {
    return { code: "APPROVAL_REJECTED", status: 403 };
  }
  return { code: "NOT_APPROVED", status: 403 };
}

export async function GET() {
  const auth = await requireApprovedWriter();

  if (!auth.ok) {
    if (auth.error === "Unauthorized") {
      return NextResponse.json({ ok: false, code: "UNAUTHORIZED", error: "Please log in." }, { status: 401 });
    }
    const { code, status } = getWriterBlockReason(auth.user);
    return NextResponse.json({ ok: false, code, error: auth.error }, { status });
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
  const limit = checkRateLimit(req, { name: "writer-post-create", limit: 10, windowMs: 10 * 60 * 1000 });
  if (!limit.ok) return rateLimitResponse(limit);

  const auth = await requireApprovedWriter();

  if (!auth.ok) {
    if (auth.error === "Unauthorized") {
      return NextResponse.json({ ok: false, code: "UNAUTHORIZED", error: "Please log in." }, { status: 401 });
    }
    const { code, status } = getWriterBlockReason(auth.user);
    return NextResponse.json({ ok: false, code, error: auth.error }, { status });
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
    return NextResponse.json(
      { ok: false, error: "Please fix the highlighted fields.", fieldErrors: errors.fieldErrors, formErrors: errors.formErrors },
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
      { ok: false, error: "A post with this slug already exists. Try a different title or set a custom slug.", fieldErrors: { slug: ["This slug is already taken"] } },
      { status: 409 }
    );
  }

  const sanitizedHtml = cleanHtml(parsed.data.contentHtml);
  if (!sanitizedHtml || sanitizedHtml.trim().length < 10) {
    return NextResponse.json(
      { ok: false, error: "Post content was stripped during sanitization. Please avoid unsupported HTML.", fieldErrors: { contentHtml: ["Post content is invalid or too short after sanitization"] } },
      { status: 400 }
    );
  }

  try {
    const isAdmin = auth.user.role === "admin";

    // Trust tier: a writer's first 3 posts always go through manual
    // review. After 3 clean approvals with zero rejections, future
    // posts auto-publish -- computed live from Post records (not a
    // cached counter), so it can never drift out of sync. A rejection
    // at any point resets them back to needing review until they
    // rebuild 3 clean approvals again.
    let isTrustedWriter = false;
    if (!isAdmin && !parsed.data.saveAsDraft) {
      const [approvedCount, rejectedCount] = await Promise.all([
        Post.countDocuments({ authorId: auth.user.id, status: "approved" }),
        Post.countDocuments({ authorId: auth.user.id, status: "rejected" }),
      ]);
      isTrustedWriter = approvedCount >= 3 && rejectedCount === 0;
    }

    // saveAsDraft wins regardless of role -- an admin clicking "Save as
    // Draft" should get a draft too, not an instantly-published post.
    const status = parsed.data.saveAsDraft
      ? "draft"
      : isAdmin
        ? "approved"
        : isTrustedWriter
          ? "approved"
          : "pending";

    const post = await Post.create({
      title:       parsed.data.title,
      slug,
      excerpt:     parsed.data.excerpt,
      coverImage:  parsed.data.coverImage || "",
      images:      Array.isArray(parsed.data.images) ? parsed.data.images : [],
      contentHtml: sanitizedHtml,
      tags:        Array.isArray(parsed.data.tags) ? parsed.data.tags : [],
      authorId:    auth.user.id,
      readTime:    parsed.data.readTime || "5 min read",
      status,
      publishedAt: status === "approved" ? new Date() : undefined,
      category:    parsed.data.category,
      postType:    parsed.data.postType || "normal",
      flair:       parsed.data.flair || "",
      isAnonymous: parsed.data.isAnonymous || false,
    });

    const admins = await User.find({ role: "admin" }, { _id: 1 }).lean();
    let notifications = [];

    if (status === "draft") {
      // Draft -- nothing to notify anyone about yet.
    } else if (status === "approved") {
      // Live immediately (admin OR a trusted writer's auto-approved
      // post) -- safe to tell followers now.
      const followers = await Follow.find({ writerId: auth.user.id }).lean();
      notifications = followers.map((follow) => ({
        userId:   follow.followerId,
        actorId:  auth.user.id,
        postId:   post._id,
        type:     "new_post",
        postSlug: post.slug,
        message:  `${auth.user.name || "A writer"} published a new post: ${post.title}`,
        read:     false,
      }));
    } else {
      // Not visible yet -- only notify admins that review is needed.
      // Followers get notified separately once the post is approved.
      notifications = admins.map((admin) => ({
        userId:   admin._id,
        actorId:  auth.user.id,
        postId:   post._id,
        type:     "post_pending_review",
        postSlug: post.slug,
        message:  `${auth.user.name || "A writer"} submitted a post for review: ${post.title}`,
        read:     false,
      }));
    }

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    return NextResponse.json({
      ok: true,
      post: serializePost(post),
      message:
        status === "draft"
          ? "Post saved as draft."
          : status === "approved"
            ? "Post published."
            : "Post submitted for review. It will go live once approved.",
    });

  } catch (err) {
    console.error("Post.create error:", err);

    if (err.name === "ValidationError") {
      const fieldErrors = {};
      for (const [key, val] of Object.entries(err.errors)) {
        fieldErrors[key] = [val.message];
      }
      return NextResponse.json({ ok: false, error: "Please fix the highlighted fields.", fieldErrors }, { status: 400 });
    }

    if (err.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0] || "slug";
      return NextResponse.json(
        { ok: false, error: "A post with this slug already exists.", fieldErrors: { [field]: [`This ${field} is already taken`] } },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { ok: false, error: err.message || "Failed to create post. Please try again." },
      { status: 500 }
    );
  }
}
