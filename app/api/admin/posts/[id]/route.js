import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { Post } from "@/models/Post";
import { Notification } from "@/models/Notification";
import { requireAdmin } from "@/lib/auth";
import { logAdminAction } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req, { params }) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

    if (!isDbEnabled()) {
      return NextResponse.json({ ok: false, error: "Service unavailable." }, { status: 503 });
    }

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ ok: false, error: "Invalid post id" }, { status: 400 });
    }

    await dbConnect();

    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ ok: false, error: "Post not found" }, { status: 404 });
    }

    const prevStatus = post.status;
    let statusChanged = false;

    if (typeof body.isFlagged === "boolean") {
      post.isFlagged = body.isFlagged;
      post.flaggedReason = body.flaggedReason || "";
    }

    if (body.status && ["approved", "rejected", "pending"].includes(body.status)) {
      statusChanged = body.status !== prevStatus;
      post.status = body.status;
      post.rejectionReason = body.status === "rejected" ? (body.rejectionReason || "") : "";

      // A post approved for the first time (e.g. a writer's pending
      // submission) never had publishedAt set -- without this it stays
      // undated forever and sorts incorrectly on the public listing
      // (which sorts by publishedAt descending).
      if (body.status === "approved" && !post.publishedAt) {
        post.publishedAt = new Date();
      }
    }



    // Validates only the fields actually changed, instead of disabling
    // validation entirely (the old runValidators: false skipped the
    // status enum check too).
    await post.save();

    if (statusChanged && (post.status === "approved" || post.status === "rejected")) {
      try {
        await Notification.create({
          userId: post.authorId,
          actorId: auth.user.id,
          postId: post._id,
          postSlug: post.slug,
          type: post.status === "approved" ? "post_approved" : "post_rejected",
          message: post.status === "approved"
            ? `Your post "${post.title}" has been approved and is now live.`
            : `Your post "${post.title}" was rejected.${post.rejectionReason ? ` Reason: ${post.rejectionReason}` : ""}`,
        });
      } catch (notifErr) {
        console.error("Notification failed:", notifErr.message);
      }
    }

    await logAdminAction({
      req,
      actor: auth.user,
      action: "admin_post_updated",
      targetType: "post",
      targetId: post._id,
      targetLabel: post.title,
      metadata: {
        slug: post.slug,
        previousStatus: prevStatus,
        status: post.status,
        statusChanged,
        isFlagged: Boolean(post.isFlagged),
      },
    });

    return NextResponse.json({ ok: true, post: post.toObject() });
  } catch (err) {
    console.error("PATCH /api/admin/posts/[id]:", err);
    if (err?.name === "ValidationError") {
      return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

    if (!isDbEnabled()) {
      return NextResponse.json({ ok: false, error: "Service unavailable." }, { status: 503 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ ok: false, error: "Invalid post id" }, { status: 400 });
    }

    await dbConnect();

    const deleted = await Post.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ ok: false, error: "Post not found" }, { status: 404 });
    }

    await logAdminAction({
      req,
      actor: auth.user,
      action: "admin_post_deleted",
      targetType: "post",
      targetId: deleted._id,
      targetLabel: deleted.title || "",
      metadata: { slug: deleted.slug || "", status: deleted.status || "" },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/posts/[id]:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
