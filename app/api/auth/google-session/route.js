import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { signToken } from "@/lib/auth";

const PUBLIC_ROLES = ["visitor", "blog_writer"];

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const requestedRole = searchParams.get("role");
  const role = PUBLIC_ROLES.includes(requestedRole) ? requestedRole : "visitor";

  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.redirect(new URL("/login?error=google", req.url));
  }

  await dbConnect();

  const email = session.user.email.toLowerCase();
  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name: session.user.name || "Google User",
      email,
      passwordHash: "",
      provider: "google",
      role,
      isVerified: true,
      writerVerification: { status: "none" },
    });
  }

  const finalRole = user.isAdmin
    ? "admin"
    : ["visitor", "blog_writer", "admin"].includes(user.role)
      ? user.role
      : "visitor";

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