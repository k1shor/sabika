import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { SavedPost } from "@/models/SavedPost";

export async function GET() {
  try {
    const auth = await requireUser();
    if (!auth.ok) return NextResponse.json({ ok: false, error: "Login required" }, { status: 401 });

    await dbConnect();

    const posts = await SavedPost.find({ userId: auth.user.id })
      .populate("postId", "title excerpt slug coverImage category tags isAnonymous publishedAt")
      .sort({ createdAt: -1 })
      .lean();

    const validPosts = posts.filter((p) => p.postId !== null);
    return NextResponse.json({ ok: true, posts: validPosts });

  } catch (err) {
    console.error("SavedPost GET error:", err.message);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const auth = await requireUser();
    if (!auth.ok) return NextResponse.json({ ok: false, error: "Login required" }, { status: 401 });

    const { postId } = await req.json().catch(() => ({}));
    if (!postId) return NextResponse.json({ ok: false, error: "postId required" }, { status: 400 });

    // ✅ validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json({ ok: false, error: "Invalid post ID" }, { status: 400 });
    }

    await dbConnect();

    await SavedPost.findOneAndUpdate(
      { userId: auth.user.id, postId },
      { userId: auth.user.id, postId },
      { upsert: true, returnDocument: "after" }
    );
    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("SavedPost POST error:", err.message);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const auth = await requireUser();
    if (!auth.ok) return NextResponse.json({ ok: false, error: "Login required" }, { status: 401 });

    const { postId } = await req.json().catch(() => ({}));
    if (!postId) return NextResponse.json({ ok: false, error: "postId required" }, { status: 400 });

    // ✅ validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json({ ok: false, error: "Invalid post ID" }, { status: 400 });
    }

    await dbConnect();

    await SavedPost.findOneAndDelete({ userId: auth.user.id, postId });
    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("SavedPost DELETE error:", err.message);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}