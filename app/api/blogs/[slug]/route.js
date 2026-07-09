import { NextResponse } from "next/server";
import { DUMMY_POSTS } from "@/lib/dummy";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { Post } from "@/models/Post";
import { getAuthUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ─── GET /api/blogs/[slug] ────────────────────────────────────────────────────

export async function GET(req, { params }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(String(slug || "")).trim();

  const editMode = req.url?.includes("edit=true");

  if (!isDbEnabled()) {
    const post = (DUMMY_POSTS || []).find(
      (p) => p.slug === decodedSlug
    );

    if (!post) {
      return NextResponse.json(
        { ok: false, error: "Not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, post });
  }

  await dbConnect();

  // Edit mode bypasses the "approved" filter so an author can load their
  // own draft/pending/rejected post — but that means it MUST be gated by
  // auth + ownership, or anyone can read anyone else's unpublished post
  // just by guessing a slug and appending ?edit=true.
  if (editMode) {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const post = await Post.findOne({ slug: decodedSlug })
      .populate("authorId", "name avatarUrl badge username bio")
      .lean();

    if (!post) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }

    const isAuthor = String(post.authorId?._id || post.authorId) === String(user.id);
    const isAdmin = user.role === "admin";

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ ok: true, post: { ...post, _id: String(post._id) } });
  }

  const post = await Post.findOne({ slug: decodedSlug, status: "approved" })
    .populate("authorId", "name avatarUrl badge username bio")
    .lean();

  if (!post) {
    return NextResponse.json(
      { ok: false, error: "Not found" },
      { status: 404 }
    );
  }

  await Post.updateOne(
    { _id: post._id },
    { $inc: { views: 1 } }
  );

  const safePost = {
    ...post,
    _id: String(post._id),
    authorId: post.isAnonymous ? null : post.authorId,
    authorLabel: post.isAnonymous
      ? "Anonymous Nurse"
      : undefined,
  };

  return NextResponse.json({
    ok: true,
    post: safePost,
  });
}

// ─── PATCH /api/blogs/[slug] — edit post ──────────────────────────────────────

export async function PATCH(req, { params }) {
  try {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(String(slug || "")).trim();

    if (!isDbEnabled()) {
      return NextResponse.json({ ok: false, error: "Edit not supported in demo mode" }, { status: 400 });
    }

    await dbConnect();

    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const post = await Post.findOne({ slug: decodedSlug });
    if (!post) {
      return NextResponse.json({ ok: false, error: "Post not found" }, { status: 404 });
    }

    const isAuthor = String(post.authorId) === String(user.id);
    const isAdmin = user.role === "admin";

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
    }

    const allowedFields = [
      "title", "excerpt", "contentHtml", "coverImage",
      "category", "postType", "flair", "tags",
      "isAnonymous", "readTime",
    ];

    const updateFields = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateFields[field] = body[field];
      }
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ ok: false, error: "Nothing to update" }, { status: 400 });
    }

    const unsetFields = {};

    if (isAdmin) {
      // admin edits stay approved — no re-review needed
      updateFields.status = post.status;
    } else {
      // writer edits go back to pending — admin must re-approve
      updateFields.status = "pending";
      updateFields.isFlagged = false;
      // $set can't clear a field — undefined values are silently dropped.
      // Use $unset to actually remove publishedAt so the post is treated
      // as unpublished until re-approved.
      unsetFields.publishedAt = "";
    }

    // Apply the update on the actual document (not raw findByIdAndUpdate)
    // so Mongoose validates only the fields being changed, instead of
    // either failing on unrelated required fields (the old bug) or
    // skipping all validation (runValidators: false — the worse bug).
    Object.assign(post, updateFields);
    if (unsetFields.publishedAt !== undefined) {
      post.publishedAt = undefined;
    }

    await post.save();

    const updated = await Post.findById(post._id).lean();

    return NextResponse.json({
      ok: true,
      post: { ...updated, _id: String(updated._id) },
      message: isAdmin
        ? "Post updated."
        : "Post updated and sent for re-review. It will reappear once approved.",
    });

  } catch (err) {
    console.error("PATCH /api/blogs/[slug]:", err);
    if (err?.name === "ValidationError") {
      return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

// ─── DELETE /api/blogs/[slug] ─────────────────────────────────────────────────

export async function DELETE(_req, { params }) {
  try {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(String(slug || "")).trim();

    if (!isDbEnabled()) {
      return NextResponse.json({ ok: false, error: "Delete not supported in demo mode" }, { status: 400 });
    }

    await dbConnect();

    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const post = await Post.findOne({ slug: decodedSlug });
    if (!post) {
      return NextResponse.json({ ok: false, error: "Post not found" }, { status: 404 });
    }

    const isAuthor = String(post.authorId) === String(user.id);
    const isAdmin = user.role === "admin";

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    await Post.findByIdAndDelete(post._id);
    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("DELETE /api/blogs/[slug]:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}