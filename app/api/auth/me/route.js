import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ ok: false, user: null });
    }

    return NextResponse.json({
      ok: true,
      user,
    });

  } catch {
    return NextResponse.json({
      ok: false,
      user: null,
      error: "Unable to read current user",
    });
  }
}
