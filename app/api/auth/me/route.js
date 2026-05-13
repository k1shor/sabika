import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ ok: false, user: null });
    }

    const decoded = verifyToken(token);

    return NextResponse.json({
      ok: true,
      user: decoded,
    });

  } catch (err) {
    return NextResponse.json({
      ok: false,
      user: null,
      error: err.message
    });
  }
}