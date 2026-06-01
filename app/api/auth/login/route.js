import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { User } from "@/models/User";
import { signToken } from "@/lib/auth";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
    }

    if (!isDbEnabled()) {
      return NextResponse.json(
        { ok: false, error: "Login is unavailable because USE_DB is not true." },
        { status: 503 }
      );
    }

    try {
      await dbConnect();
    } catch (err) {
      console.error("Login DB connection failed:", err);
      return NextResponse.json(
        { ok: false, error: "Database connection failed. Check MONGODB_URI." },
        { status: 500 }
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const password = parsed.data.password;

    const user = await User.findOne({ email });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        {
          ok: false,
          error: user?.provider === "google"
            ? "This account uses Google login. Please use Login with Google."
            : "Invalid credentials",
        },
        { status: 401 }
      );
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
    }

    if (!user.isVerified) {
      return NextResponse.json(
        { ok: false, error: "Please verify your email first" },
        { status: 403 }
      );
    }

    const role = user.isAdmin
      ? "admin"
      : ["visitor", "blog_writer", "admin"].includes(user.role)
        ? user.role
        : "visitor";

    const token = signToken({
      id: user._id,
      name: user.name,
      email: user.email,
      role,
    });

    const res = NextResponse.json({
      ok: true,
      message: "Login success",
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role,
        writerVerification: {
          status: user.writerVerification?.status || "none",
          category: user.writerVerification?.category || null,
        },
      },
    });

    res.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return res;
  } catch (err) {
    console.error("Login failed:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Login failed" },
      { status: 500 }
    );
  }
}
