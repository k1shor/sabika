import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { signToken } from "@/lib/auth";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(req) {
  try {
    const body = await req.json().catch(() => null);

    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
    }

    await dbConnect();

    const email = parsed.data.email.trim().toLowerCase();
    const password = parsed.data.password;

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
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

    const safeUser = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role,
      writerVerification: {
        status: user.writerVerification?.status || "none",
        category: user.writerVerification?.category || null,
      },
    };

    const res = NextResponse.json({
      ok: true,
      message: "Login success",
      user: safeUser,
    });

    res.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return res;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Login failed" },
      { status: 500 }
    );
  }
}
