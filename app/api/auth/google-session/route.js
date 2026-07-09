import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { signToken, normalizeRole } from "@/lib/auth";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action"); // "signup" | "login"

  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    const dest = action === "signup" ? "/register" : "/login";
    return NextResponse.redirect(new URL(`${dest}?error=google`, req.url));
  }

  await dbConnect();

  const email = session.user.email.toLowerCase();
  const user = await User.findOne({ email });

  // ── SIGNUP FLOW ──
  if (action === "signup") {
    if (user) {
      return NextResponse.redirect(
        new URL("/register?error=google_exists", req.url)
      );
    }

    // Every Google signup starts as "visitor" — role can never be
    // self-selected via query param. Becoming a blog_writer requires
    // going through the writer-application + admin-approval flow.
    const newUser = await User.create({
      name: session.user.name || "Google User",
      email,
      passwordHash: "",
      provider: "google",
      role: "visitor",
      isVerified: true,
      writerVerification: { status: "none" },
    });

    return buildTokenResponse(newUser, req);
  }

  // ── LOGIN FLOW ──
  if (action === "login") {
    if (!user) {
      return NextResponse.redirect(
        new URL("/login?error=google_not_found", req.url)
      );
    }

    if (user.isBanned) {
      return NextResponse.redirect(
        new URL("/login?error=account_disabled", req.url)
      );
    }

    return buildTokenResponse(user, req);
  }

  return NextResponse.redirect(new URL("/login?error=google", req.url));
}

function buildTokenResponse(user, req) {
  const finalRole = normalizeRole(user);

  const token = signToken({
    id: user._id,
    name: user.name,
    email: user.email,
    role: finalRole,
  });

  const res = NextResponse.redirect(new URL("/dashboard", req.url));

  res.cookies.set("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return res;
}