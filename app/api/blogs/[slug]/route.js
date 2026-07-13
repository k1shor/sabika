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

    if (Object.keys(updateFields).length === 0 && body.publish === undefined) {
      return NextResponse.json({ ok: false, error: "Nothing to update" }, { status: 400 });
    }

    const unsetFields = {};
    // "publish" is an explicit intent sent by the edit form's Publish
    // button, distinct from just saving edits. Without this, a draft
    // (or admin-authored draft) had no way to ever become "approved" --
    // admin edits used to just preserve whatever status.draft already
    // was, and writer edits always forced "pending" with no way to
    // signal "actually publish this now".
    const wantsPublish = body.publish === true;

    if (wantsPublish && isAdmin) {
      updateFields.status = "approved";
      if (!post.publishedAt) updateFields.publishedAt = new Date();
      updateFields.isFlagged = false;
    } else if (wantsPublish && !isAdmin) {
      // Same trust-tier rule as creating a new post: writers with 3+
      // clean approvals auto-publish, everyone else goes to pending.
      const [approvedCount, rejectedCount] = await Promise.all([
        Post.countDocuments({ authorId: user.id, status: "approved" }),
        Post.countDocuments({ authorId: user.id, status: "rejected" }),
      ]);
      const isTrustedWriter = approvedCount >= 3 && rejectedCount === 0;

      updateFields.status = isTrustedWriter ? "approved" : "pending";
      if (isTrustedWriter && !post.publishedAt) updateFields.publishedAt = new Date();
      updateFields.isFlagged = false;
    } else if (isAdmin) {
      // Plain "save edits" (not publish) -- admin edits stay whatever
      // status they already were, no re-review needed.
      updateFields.status = post.status;
    } else {
      // Plain "save edits" on an already-live post -- writer edits go
      // back to pending, admin must re-approve. Only applies to posts
      // that were already approved; editing a draft without hitting
      // Publish just keeps it a draft.
      if (post.status === "approved") {
        updateFields.status = "pending";
        unsetFields.publishedAt = "";
      }
      updateFields.isFlagged = false;
    }

    Object.assign(post, updateFields);
    if (unsetFields.publishedAt !== undefined) {
      post.publishedAt = undefined;
    }

    await post.save();

    const updated = await Post.findById(post._id).lean();

    return NextResponse.json({
      ok: true,
      post: { ...updated, _id: String(updated._id) },
      message:
        updateFields.status === "approved"
          ? "Post published."
          : updateFields.status === "pending"
            ? "Post updated and sent for re-review. It will reappear once approved."
            : "Draft saved.",
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