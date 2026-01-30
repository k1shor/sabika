import { NextResponse } from "next/server";
import { DUMMY_POSTS } from "@/lib/dummy";
import { dbConnect, useDb } from "@/lib/db";
import { Post } from "@/models/Post";

function normalizeSlug(v) {
  return decodeURIComponent(String(v || "")).trim().replace(/\/+$/, "");
}

function serializePost(p) {
  if (!p) return p;

  const out = { ...p };

  if (out._id && typeof out._id !== "string") out._id = String(out._id);

  if (out.createdAt instanceof Date) out.createdAt = out.createdAt.toISOString();
  if (out.updatedAt instanceof Date) out.updatedAt = out.updatedAt.toISOString();
  if (out.publishedAt instanceof Date) out.publishedAt = out.publishedAt.toISOString();

  return out;
}

export async function GET(_req, { params }) {
  const { slug: rawSlug } = await params;
  const slug = normalizeSlug(rawSlug);

  if (!slug) {
    return NextResponse.json({ ok: false, error: "Missing slug" }, { status: 400 });
  }

  const findDummy = () =>
    (Array.isArray(DUMMY_POSTS) ? DUMMY_POSTS : []).find(
      (p) => normalizeSlug(p?.slug) === slug
    );

  if (!useDb()) {
    const post = findDummy();
    if (!post) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true, post: serializePost(post) });
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
