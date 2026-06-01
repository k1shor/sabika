import { NextResponse } from "next/server";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ContactMessage } from "@/models/ContactMessage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function serializeMessage(message) {
  return {
    _id: String(message._id),
    name: message.name || "",
    email: message.email || "",
    message: message.message || "",
    emailSent: Boolean(message.emailSent),
    emailError: message.emailError || "",
    read: Boolean(message.read),
    createdAt: message.createdAt instanceof Date ? message.createdAt.toISOString() : message.createdAt,
  };
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error || "Forbidden" }, { status: 403 });

  if (!isDbEnabled()) {
    return NextResponse.json({ ok: false, error: "Database is disabled. Enable USE_DB=true" }, { status: 400 });
  }

  await dbConnect();

  const messages = await ContactMessage.find({})
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return NextResponse.json({ ok: true, messages: messages.map(serializeMessage) });
}
