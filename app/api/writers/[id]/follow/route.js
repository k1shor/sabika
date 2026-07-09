// import { NextResponse } from "next/server";
// import { dbConnect } from "@/lib/db";
// import { requireUser } from "@/lib/auth";
// import { User } from "@/models/User";
// import { Follow } from "@/models/Follow";
// import { Notification } from "@/models/Notification";

// async function followerState(userId, writerId) {
//   const [followerCount, follow] = await Promise.all([
//     Follow.countDocuments({ writerId }),
//     userId ? Follow.findOne({ followerId: userId, writerId }).lean() : null,
//   ]);

//   return { followerCount, following: Boolean(follow) };
// }

// export async function GET(_req, { params }) {
//   const auth = await requireUser();
//   const { id } = await params;

//   await dbConnect();

//   const state = await followerState(auth.ok ? auth.user.id : null, id);
//   return NextResponse.json({ ok: true, ...state });
// }

// export async function POST(_req, { params }) {
//   const auth = await requireUser();
//   if (!auth.ok) return NextResponse.json({ ok: false, error: "Login required" }, { status: 401 });

//   const { id } = await params;

//   if (String(auth.user.id) === String(id)) {
//     return NextResponse.json({ ok: false, error: "You cannot follow yourself" }, { status: 400 });
//   }

//   await dbConnect();

//   const writer = await User.findOne({
//     _id: id,
//     role: "blog_writer",
//     "writerVerification.status": "approved",
//   });

//   if (!writer) {
//     return NextResponse.json({ ok: false, error: "Writer not found" }, { status: 404 });
//   }

//   const existing = await Follow.findOne({ followerId: auth.user.id, writerId: id }).lean();

//   if (!existing) {
//     await Follow.create({ followerId: auth.user.id, writerId: id });

//     // Keep the cached stats.totalFollowers / stats.totalFollowing on
//     // User in sync. The follower count shown to users is always
//     // computed live (see followerState), so this doesn't affect
//     // correctness of what's displayed today -- it just prevents the
//     // cached fields from silently rotting for whatever else may read
//     // them later (e.g. session payload, admin views).
//     await Promise.all([
//       User.updateOne({ _id: id }, { $inc: { "stats.totalFollowers": 1 } }),
//       User.updateOne({ _id: auth.user.id }, { $inc: { "stats.totalFollowing": 1 } }),
//       Notification.create({
//         userId: id,
//         actorId: auth.user.id,
//         type: "new_follower",
//         message: `${auth.user.name || "Someone"} started following you.`,
//         read: false,
//       }),
//     ]);
//   }

//   const state = await followerState(auth.user.id, id);

//   return NextResponse.json({ ok: true, message: "Writer followed", ...state });
// }

// export async function DELETE(_req, { params }) {
//   const auth = await requireUser();
//   if (!auth.ok) return NextResponse.json({ ok: false, error: "Login required" }, { status: 401 });

//   const { id } = await params;

//   await dbConnect();

//   const deleted = await Follow.findOneAndDelete({ followerId: auth.user.id, writerId: id });

//   if (deleted) {
//     // Never let the cached counter go negative even if it had already
//     // drifted before this fix existed.
//     await Promise.all([
//       User.updateOne(
//         { _id: id, "stats.totalFollowers": { $gt: 0 } },
//         { $inc: { "stats.totalFollowers": -1 } }
//       ),
//       User.updateOne(
//         { _id: auth.user.id, "stats.totalFollowing": { $gt: 0 } },
//         { $inc: { "stats.totalFollowing": -1 } }
//       ),
//     ]);
//   }

//   const state = await followerState(auth.user.id, id);

//   return NextResponse.json({ ok: true, message: "Writer unfollowed", ...state });
// }