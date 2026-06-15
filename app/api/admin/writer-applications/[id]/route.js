// import { NextResponse } from "next/server";
// import { z } from "zod";
// import sanitizeHtml from "sanitize-html";
// import { dbConnect, isDbEnabled } from "@/lib/db";
// import { Post } from "@/models/Post";
// import { requireAdmin } from "@/lib/auth";
// import { DUMMY_POSTS } from "@/lib/dummy";

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// function slugify(value) {
//   return String(value || "")
//     .toLowerCase()
//     .trim()
//     .replace(/['"]/g, "")
//     .replace(/[^a-z0-9]+/g, "-")
//     .replace(/-+/g, "-")
//     .replace(/(^-|-$)/g, "");
// }

// function cleanHtml(html) {
//   return sanitizeHtml(String(html || ""), {
//     allowedTags: [
//       "p",
//       "br",
//       "strong",
//       "em",
//       "u",
//       "s",
//       "blockquote",
//       "ul",
//       "ol",
//       "li",
//       "h2",
//       "h3",
//       "h4",
//       "a",
//       "img",
//       "code",
//       "pre",
//       "hr",
//     ],
//     allowedAttributes: {
//       a: ["href", "target", "rel"],
//       img: ["src", "alt", "title"],
//     },
//     allowedSchemes: ["http", "https", "mailto"],
//     transformTags: {
//       a: sanitizeHtml.simpleTransform("a", { rel: "nofollow noopener noreferrer", target: "_blank" }),
//     },
//   });
// }

// function optionalString(schema) {
//   return z.preprocess((value) => {
//     if (typeof value !== "string") return value;
//     const trimmed = value.trim();
//     return trimmed ? trimmed : undefined;
//   }, schema.optional());
// }

// const OptionalUrlSchema = optionalString(z.string().url());
// const OptionalDateSchema = optionalString(
//   z.string().refine((value) => !Number.isNaN(new Date(value).getTime()), "Invalid date")
// );

// const CreatePostSchema = z.object({
//   title: z.string().trim().min(3).max(160),
//   slug: optionalString(z.string().min(3).max(200)),
//   excerpt: optionalString(z.string().max(400)),
//   coverImage: OptionalUrlSchema,
//   images: z.array(z.string().url()).optional(),
//   contentHtml: optionalString(z.string().min(10)),
//   tags: z.array(z.string().trim().min(1).max(40)).optional(),
//   author: optionalString(z.string().max(80)),
//   readTime: optionalString(z.string().max(30)),
//   publishedAt: OptionalDateSchema,
// });

// export async function GET() {
//   if (!isDbEnabled()) {
//     const posts = (DUMMY_POSTS || []).map((p) => ({ ...p, _id: p.slug }));
//     return NextResponse.json({ ok: true, posts });
//   }

//   await dbConnect();

//   const posts = await Post.find({})
//     .sort({ publishedAt: -1 })
//     .lean();

//   return NextResponse.json({ ok: true, posts });
// }

// export async function POST(req) {
//   const auth = await requireAdmin();
//   if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error || "Forbidden" }, { status: 403 });

//   const body = await req.json().catch(() => null);
//   const parsed = CreatePostSchema.safeParse(body);

//   if (!parsed.success) {
//     return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
//   }

//   if (!isDbEnabled()) {
//     return NextResponse.json({ ok: false, error: "Database is disabled. Enable USE_DB=true" }, { status: 400 });
//   }

//   await dbConnect();

//   const title = parsed.data.title;
//   const slug = slugify(parsed.data.slug || title);
//   if (!slug) return NextResponse.json({ ok: false, error: "Invalid slug" }, { status: 400 });

//   const exists = await Post.findOne({ slug }).lean();
//   if (exists) return NextResponse.json({ ok: false, error: "Slug already exists" }, { status: 409 });

//   const coverImage = parsed.data.coverImage || "";
//   const images = Array.isArray(parsed.data.images) ? parsed.data.images : [];

//   const contentHtml = cleanHtml(parsed.data.contentHtml || "");

//   const post = await Post.create({
//     title,
//     slug,
//     excerpt: parsed.data.excerpt || "",
//     coverImage,
//     images,
//     contentHtml,
//     tags: Array.isArray(parsed.data.tags) ? parsed.data.tags : [],
//     author: parsed.data.author || "Nursing Nepal",
//     readTime: parsed.data.readTime || "5 min read",
//     publishedAt: parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : new Date(),
//   });

//   return NextResponse.json({ ok: true, post });
// }
import { NextResponse } from "next/server";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { User } from "@/models/User";
import { Notification } from "@/models/Notification";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function deriveBadge(category) {
  if (category === "nursing_student" || category === "entrance_exam_passed") return "nursing_student";
  if (category === "registered_nurse" || category === "nurse_working_nepal")  return "registered_nurse";
  if (category === "nurse_studying_abroad" || category === "nurse_working_abroad") return "abroad_nurse";
  return "";
}

export async function PATCH(req, { params }) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  if (!isDbEnabled()) {
    return NextResponse.json({ ok: false, error: "Service unavailable." }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  const { status, rejectionReason } = body;

  if (!["approved", "rejected"].includes(status)) {
    return NextResponse.json({ ok: false, error: "Status must be approved or rejected" }, { status: 400 });
  }

  await dbConnect();
  const { id } = await params;
  console.log("Looking for user with id:", id); 
  const user = await User.findById(id);
  console.log("Found user:", user?._id); 
  if (!user) {
    return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
  }

  if (!user.writerVerification) {
    return NextResponse.json({ ok: false, error: "No writer application found" }, { status: 400 });
  }

  // update verification
  user.writerVerification.status       = status;
  user.writerVerification.reviewedAt   = new Date();
  user.writerVerification.rejectionReason = status === "rejected"
    ? (rejectionReason?.trim() || "")
    : "";

  // if approved — set role and badge
  if (status === "approved") {
    user.role  = "blog_writer";
    user.badge = deriveBadge(user.writerVerification.category);
  }

  await user.save();

  // notify the writer
  try {
    await Notification.create({
      userId:  user._id,
      actorId: auth.user.id,
      type:    status === "approved" ? "writer_approved" : "writer_rejected",
      message: status === "approved"
        ? "Your writer application has been approved! You can now publish posts."
        : `Your writer application was rejected.${rejectionReason?.trim() ? ` Reason: ${rejectionReason.trim()}` : ""}`,
    });
  } catch (notifErr) {
    // don't fail the whole request if notification fails
    console.error("Notification failed:", notifErr.message);
  }

  return NextResponse.json({
    ok: true,
    application: {
      _id:   String(user._id),
      name:  user.name,
      email: user.email,
      role:  user.role,
      badge: user.badge,
      writerVerification: {
        status:          user.writerVerification.status,
        category:        user.writerVerification.category,
        licenseNo:       user.writerVerification.licenseNo || "",
        workplace:       user.writerVerification.workplace || "",
        documentUrl:     user.writerVerification.documentUrl || "",
        submittedAt:     user.writerVerification.submittedAt || null,
        reviewedAt:      user.writerVerification.reviewedAt || null,
        rejectionReason: user.writerVerification.rejectionReason || "",
      },
    },
  });
}