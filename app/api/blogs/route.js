import { NextResponse } from "next/server";
import { DUMMY_POSTS } from "@/lib/dummy";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { Post } from "@/models/Post";
import { requireApprovedWriter } from "@/lib/auth";
import { PostCreateSchema } from "@/lib/validators";
import { Follow } from "@/models/Follow";
import { Notification } from "@/models/Notification";

export async function GET(req) {
  if (!isDbEnabled()) {
    const posts = (DUMMY_POSTS || []).map((p) => ({ ...p }));
    return NextResponse.json({ ok: true, posts });
  }

  await dbConnect();

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(20, parseInt(searchParams.get("limit") || "10"));
  const category = searchParams.get("category");
  const postType = searchParams.get("postType");
  const tag = searchParams.get("tag");

  // only approved posts to public
  const filter = { status: "approved" };
  if (category) filter.category = category;
  if (postType) filter.postType = postType;
  if (tag) filter.tags = tag;

  const [posts, total] = await Promise.all([
    Post.find(filter, {
      title: 1, slug: 1, excerpt: 1, coverImage: 1,
      tags: 1, readTime: 1, publishedAt: 1, createdAt: 1,
      category: 1, postType: 1, isAnonymous: 1,
      authorId: 1, likesCount: 1, views: 1,
    })
      .populate({
        path: "authorId",
        select: "name avatarUrl badge username",
      })
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Post.countDocuments(filter),
  ]);

  // hide author info for anonymous posts
  const safePosts = posts.map((p) => ({
    ...p,
    authorId: p.isAnonymous
      ? null
      : p.authorId,
    authorLabel: p.isAnonymous ? "Anonymous Nurse" : undefined,
  }));

  const mine = searchParams.get("mine");
  if (mine === "true" && auth?.user?.id) {
    filter.authorId = auth.user.id;
    delete filter.status; // show their own drafts/pending too
  }
  return NextResponse.json({
    ok: true,
    posts: safePosts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(req) {
  const auth = await requireApprovedWriter();
  if (!auth.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: auth.error || "Unauthorized",
        next: auth.error === "Writer approval required" ? "/apply-writer" : undefined,
      },
      { status: auth.error === "Unauthorized" ? 401 : 403 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });

  const parsed = PostCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid data" }, { status: 400 });
  }

  if (!isDbEnabled()) {
    return NextResponse.json({ ok: false, error: "USE_DB=false" }, { status: 503 });
  }

  await dbConnect();

  const isAutoApproved = parsed.data.postType !== "reality_check";
  const created = await Post.create({
    ...parsed.data,
    authorId: auth.user.id,
    status: isAutoApproved ? "approved" : "pending",        // auto approve verified writers
    publishedAt: isAutoApproved ? new Date() : undefined,
  });
  const followers = await Follow.find({ writerId: auth.user.id }).lean();
  // NOW notify followers immediately — this makes sense
  if (isAutoApproved && followers.length > 0) {
    await Notification.insertMany(
      followers.map((follow) => ({
        userId: follow.followerId,
        actorId: auth.user.id,   // fixed from writerId
        type: "new_post",
        postId: created._id,
        postSlug: created.slug,
        message: `${auth.user.name} published: ${created.title}`,
        read: false,
      }))
    );
  }
  return NextResponse.json({ ok: true, post: created }, { status: 201 });
}
