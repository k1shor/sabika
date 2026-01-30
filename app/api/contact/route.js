import { NextResponse } from "next/server";
import { ContactSchema } from "@/lib/validators";

export async function POST(req) {
  const body = await req.json();
  const parsed = ContactSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid data" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
