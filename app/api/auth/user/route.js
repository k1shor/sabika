import { NextResponse } from "next/server";
import { dbConnect,isDbEnabled } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { User } from "@/models/User";
import { SavedPost } from "@/models/SavedPost";
import { Follow } from "@/models/Follow";
import { Notification } from "@/models/Notification";
import { Post } from "@/models/Post";
export async function DELETE() {
  const auth = await requireUser();

  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: "Login required" }, { status: 401 });
  }
  if (!isDbEnabled()) {
    return NextResponse.json({ ok: false, error: "Service unavailable." }, { status: 503 });
  }
  await dbConnect();
  await Post.deleteMany({ authorId: auth.user.id });
  await SavedPost.deleteMany({ userId: auth.user.id });
  await Follow.deleteMany({
    $or: [{ followerId: auth.user.id }, { writerId: auth.user.id }],
  });
  await Notification.deleteMany({ userId: auth.user.id });
  await User.findByIdAndDelete(auth.user.id);

  const res = NextResponse.json({ ok: true, message: "Account deleted" });

  res.cookies.set("token", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return res;
}