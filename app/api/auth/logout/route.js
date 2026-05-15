import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({
      ok: true,
      message: "Logged out successfully",
    });

    response.cookies.set("token", "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
