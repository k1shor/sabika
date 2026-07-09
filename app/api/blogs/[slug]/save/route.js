// import { NextResponse } from "next/server";
// import { dbConnect, isDbEnabled } from "@/lib/db";
// import { requireUser } from "@/lib/auth";
// import { Post } from "@/models/Post";
// import { SavedPost } from "@/models/SavedPost";

// export async function POST(_req, { params }) {
//   const auth = await requireUser();
//   if (!auth.ok) return NextResponse.json({ ok: false, error: "Login required" }, { status: 401 });

//   const { slug } = await params;

//   if (!isDbEnabled()) {
//     return NextResponse.json({ ok: false, error: "Saving is currently unavailable" }, { status: 503 });
//   }

//   await dbConnect();

//   const dbPost = await Post.findOne({ slug, status: "approved" }, { _id: 1 }).lean();

//   if (!dbPost) {
//     return NextResponse.json({ ok: false, error: "Post not found" }, { status: 404 });
//   }

//   await SavedPost.findOneAndUpdate(
//     { userId: auth.user.id, postId: dbPost._id },
//     { userId: auth.user.id, postId: dbPost._id },
//     { upsert: true }
//   );

//   return NextResponse.json({ ok: true, message: "Post saved" });
// }

// export async function DELETE(_req, { params }) {
//   const auth = await requireUser();
//   if (!auth.ok) return NextResponse.json({ ok: false, error: "Login required" }, { status: 401 });

//   const { slug } = await params;

//   if (!isDbEnabled()) {
//     return NextResponse.json({ ok: false, error: "This action is currently unavailable" }, { status: 503 });
//   }

//   await dbConnect();

//   const dbPost = await Post.findOne({ slug }, { _id: 1 }).lean();
//   if (!dbPost) {
//     return NextResponse.json({ ok: true, message: "Post removed from saved list" });
//   }

//   await SavedPost.deleteOne({ userId: auth.user.id, postId: dbPost._id });

//   return NextResponse.json({ ok: true, message: "Post removed from saved list" });
// }