import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ ok: true, user: null });
  return NextResponse.json({ ok: true, user });
}
