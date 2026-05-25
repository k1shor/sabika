import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { SavedPost } from "@/models/SavedPost";

export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return NextResponse.json({ ok: false, error: "Login required" }, { status: 401 });

  await dbConnect();

  const posts = await SavedPost.find({ userId: auth.user.id })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ ok: true, posts });
}