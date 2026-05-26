import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Notification } from "@/models/Notification";

export async function GET() {
  const auth = await requireUser();

  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: "Login required" },
      { status: 401 }
    );
  }

  await dbConnect();

  const notifications = await Notification.find({ userId: auth.user.id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return NextResponse.json({ ok: true, notifications });
}

export async function PATCH() {
  const auth = await requireUser();

  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: "Login required" },
      { status: 401 }
    );
  }

  await dbConnect();

  await Notification.updateMany(
    { userId: auth.user.id, read: false },
    { read: true }
  );

  return NextResponse.json({ ok: true });
}
