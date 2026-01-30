import { NextResponse } from "next/server";
import { DUMMY_POSTS } from "@/lib/dummy";
import { dbConnect, useDb } from "@/lib/db";
import { Post } from "@/models/Post";
import { getAuthUser } from "@/lib/auth";
import { PostCreateSchema } from "@/lib/validators";

export async function GET() {
  if (!useDb()) {
    const posts = [...DUMMY_POSTS].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    return NextResponse.json({ ok: true, posts });
  }

  await dbConnect();
  const posts = await Post.find().sort({ publishedAt: -1 }).lean();
  return NextResponse.json({ ok: true, posts });
}

export async function POST(req) {
  const user = getAuthUser();
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = PostCreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid data" }, { status: 400 });

  if (!useDb()) return NextResponse.json({ ok: false, error: "USE_DB=false" }, { status: 400 });

  await dbConnect();
  const created = await Post.create({ ...parsed.data, publishedAt: new Date() });
  return NextResponse.json({ ok: true, post: created });
}
