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
// add unreadCount to GET response
const [notifications, unreadCount] = await Promise.all([
  Notification.find({ userId: auth.user.id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean(),
  Notification.countDocuments({ userId: auth.user.id, read: false }),
]);

return NextResponse.json({ ok: true, notifications, unreadCount });
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
    { read: true, readAt: new Date() }
  );

  return NextResponse.json({ ok: true });
}
