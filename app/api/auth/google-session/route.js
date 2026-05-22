import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { signToken } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_ROLES = ["visitor", "blog_writer"];

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedRole    = searchParams.get("role");
    const role             = VALID_ROLES.includes(requestedRole) ? requestedRole : "visitor";

    console.log("google-session: requested role:", role);

    // 1. Get NextAuth session
    const session = await getServerSession(authOptions);
    console.log("google-session: session:", session?.user?.email);

    if (!session?.user?.email) {
      console.error("google-session: no session found");
      return NextResponse.redirect(new URL("/login?error=google", req.url));
    }

    // 2. Find or create user
    await dbConnect();
    let dbUser = await User.findOne({ email: session.user.email });
    console.log("google-session: dbUser found:", !!dbUser);

    if (!dbUser) {
      dbUser = await User.create({
        name:         session.user.name,
        email:        session.user.email,
        passwordHash: "",
        role,
        isVerified:   true,
        provider:     "google",
      });
      console.log("google-session: created new user with role:", role);
    } else {
      console.log("google-session: existing user role:", dbUser.role);
    }

    // 3. Sign JWT
    const finalRole = VALID_ROLES.includes(dbUser.role) || dbUser.role === "admin"
      ? dbUser.role
      : "visitor";

    const token = signToken({
      id:    dbUser._id,
      name:  dbUser.name,
      email: dbUser.email,
      role:  finalRole,
    });

    // 4. Set cookie + redirect
    const response = NextResponse.redirect(new URL("/dashboard", req.url));
    response.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure:   process.env.NODE_ENV === "production",
      path:     "/",
      maxAge:   60 * 60 * 24,
    });

    return response;

  } catch (err) {
    console.error("google-session ERROR:", err.message, err.stack);
    return NextResponse.redirect(new URL("/login?error=server", req.url));
  }
}
