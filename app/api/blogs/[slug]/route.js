import { NextResponse } from "next/server";
import { DUMMY_POSTS } from "@/lib/dummy";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { Post } from "@/models/Post";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  const slug = decodeURIComponent(String(params?.slug || "")).trim();

  if (!isDbEnabled()) {
    const post = (DUMMY_POSTS || []).find((p) => p.slug === slug);
    if (!post) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true, post });
  }

  await dbConnect();

  const dbPost = await Post.findOne({ slug }).lean();
  if (dbPost) {
    return NextResponse.json({ ok: true, post: serializePost(dbPost) });
  }

  const dummyPost = findDummy();
  if (!dummyPost) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, post: serializePost(dummyPost) });
}
