import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { User } from "@/models/User";
import { signToken, normalizeRole } from "@/lib/auth";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, code: "INVALID_INPUT", error: "Please enter a valid email and password." },
        { status: 400 }
      );
    }

    if (!isDbEnabled()) {
      return NextResponse.json(
        { ok: false, code: "DB_DISABLED", error: "Login is unavailable because USE_DB is not true." },
        { status: 503 }
      );
    }

    try {
      await dbConnect();
    } catch (err) {
      console.error("Login DB connection failed:", err);
      return NextResponse.json(
        { ok: false, code: "DB_ERROR", error: "Database connection failed. Check MONGODB_URI." },
        { status: 500 }
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const password = parsed.data.password;

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { ok: false, code: "USER_NOT_FOUND", error: "No account found with this email. Please register first." },
        { status: 404 }
      );
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { ok: false, code: "GOOGLE_ACCOUNT", error: "This account uses Google login. Please use Login with Google." },
        { status: 400 }
      );
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return NextResponse.json(
        { ok: false, code: "WRONG_PASSWORD", error: "Incorrect password. Please try again." },
        { status: 401 }
      );
    }

    if (user.isBanned) {
      return NextResponse.json(
        { ok: false, code: "ACCOUNT_DISABLED", error: "Your account has been suspended. Please contact support." },
        { status: 403 }
      );
    }

    if (!user.isVerified) {
      return NextResponse.json(
        { ok: false, code: "EMAIL_NOT_VERIFIED", error: "Your email is not verified. Please check your inbox and verify your account." },
        { status: 403 }
      );
    }

    const role = normalizeRole(user);

    const token = signToken({
      id: user._id,
      name: user.name,
      email: user.email,
      role,
      avatarUrl: user.avatarUrl || "",
    });

    const res = NextResponse.json({
      ok: true,
      message: "Login success",
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role,
        avatarUrl: user.avatarUrl || "",
        username: user.username || null,
        badge: user.badge || "",
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
      { ok: false, code: "SERVER_ERROR", error: err?.message || "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}