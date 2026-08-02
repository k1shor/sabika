import { NextResponse } from "next/server";
import { DUMMY_POSTS } from "@/lib/dummy";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { Post } from "@/models/Post";
import { getAuthUser } from "@/lib/auth";

export async function GET(req) {
  if (!isDbEnabled()) {
    return NextResponse.json({ ok: true, posts: DUMMY_POSTS || [] });
  }

  await dbConnect();

  const { searchParams } = new URL(req.url);
  const page     = Math.max(1, parseInt(searchParams.get("page")  || "1"));
  const limit    = Math.min(20, parseInt(searchParams.get("limit") || "10"));
  const category = searchParams.get("category");
  const postType = searchParams.get("postType");
  const tag      = searchParams.get("tag");
  const mine     = searchParams.get("mine");

  const filter = { status: "approved" };
  if (category) filter.category = category;
  if (postType) filter.postType = postType;
  if (tag)      filter.tags     = tag;

  // mine=true — show own posts regardless of status
  if (mine === "true") {
    const authUser = await getAuthUser();
    if (authUser?.id) {
      filter.authorId = authUser.id;
      delete filter.status;
    }
  }

  const [posts, total] = await Promise.all([
    Post.find(filter, {
      title: 1, slug: 1, excerpt: 1, coverImage: 1,
      tags: 1, flair: 1, readTime: 1, publishedAt: 1,
      category: 1, postType: 1, isAnonymous: 1,
      isOfficialPost: 1,   // ✅ added
      authorId: 1, likesCount: 1, views: 1, status: 1,
    })
      .populate({ path: "authorId", select: "name avatarUrl badge username" }) // ✅ was missing
      .sort({ publishedAt: -1 })                                                // ✅ was missing
      .skip((page - 1) * limit)                                                 // ✅ was missing
      .limit(limit)                                                              // ✅ was missing
      .lean(),                                                                   // ✅ was missing
    Post.countDocuments(filter),
  ]);

  // ✅ use isOfficialPost not authorId.role
  const safePosts = posts.map((p) => ({
    ...p,
    authorId: p.isAnonymous ? null : p.authorId,
    // no need for authorLabel — BlogCard handles display logic itself
  }));

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

// export async function POST(req) {
//   const auth = await getAuthUser();
// if (!auth) {
//   return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
// }
// // Admin bypasses writer check, writers still need approval
// if (auth.role !== "admin") {
//   const writerCheck = await requireApprovedWriter();
//   if (!writerCheck.ok) {
//     return NextResponse.json(
//       {
//         ok: false,
//         error: writerCheck.error || "Unauthorized",
//         next: writerCheck.error === "Writer approval required" ? "/apply-writer" : undefined,
//       },
//       { status: writerCheck.error === "Unauthorized" ? 401 : 403 }
//     );
//   }
// }
//   const body = await req.json().catch(() => null);
//   if (!body) return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });

//   const parsed = PostCreateSchema.safeParse(body);
//   if (!parsed.success) {
//     return NextResponse.json({
//       ok: false,
//       error: "Invalid data",
//       fields: parsed.error.flatten().fieldErrors, // ✅ field-wise errors
//     }, { status: 400 });
//   }

//   if (!isDbEnabled()) {
//     return NextResponse.json({ ok: false, error: "USE_DB=false" }, { status: 503 });
//   }

//   await dbConnect();

//   const isAutoApproved = parsed.data.postType !== "reality_check";

//   const created = await Post.create({
//     ...parsed.data,
//     authorId:       auth.user.id,
//     isOfficialPost: auth.user.role === "admin",
//     status:         isAutoApproved ? "approved" : "pending",
//     publishedAt:    isAutoApproved ? new Date() : undefined,
//   });

//   const followers = await Follow.find({ writerId: auth.user.id }).lean();
//   if (isAutoApproved && followers.length > 0) {
//     await Notification.insertMany(
//       followers.map((follow) => ({
//         userId:   follow.followerId,
//         actorId:  auth.user.id,
//         type:     "new_post",
//         postId:   created._id,
//         postSlug: created.slug,
//         message:  `${auth.user.name} published: ${created.title}`,
//         read:     false,
//       }))
//     );
//   }

//   return NextResponse.json({ ok: true, post: created }, { status: 201 });
// }
