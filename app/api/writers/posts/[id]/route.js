import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { requireApprovedWriter } from "@/lib/auth";
import { Post } from "@/models/Post";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(_req, { params }) {
  const auth = await requireApprovedWriter();
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error || "Forbidden" }, { status: auth.error === "Unauthorized" ? 401 : 403 });
  }

  if (!isDbEnabled()) {
    return NextResponse.json({ ok: false, error: "Database is disabled. Enable USE_DB=true" }, { status: 400 });
  }

  const { id } = await params;
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
  }

  await dbConnect();

  const deleted = await Post.findOneAndDelete({ _id: id, authorId: auth.user.id }).lean();
  if (!deleted) {
    return NextResponse.json({ ok: false, error: "Post not found or not owned by you" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
