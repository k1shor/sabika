import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { User } from "@/models/User";
import { signToken } from "@/lib/auth";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// function isDemoAuthEnabled() {
//   return String(process.env.DEMO_AUTH).toLowerCase() === "true";
// }

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
      user: safeUser
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

//   const email = parsed.data.email.trim().toLowerCase();
//   const password = parsed.data.password;

//   if (!isDbEnabled()) {
//     if (!isDemoAuthEnabled()) {
//       return NextResponse.json({ ok: false, error: "Authentication database is disabled" }, { status: 503 });
//     }

//     const demoEmail = String(process.env.DEMO_ADMIN_EMAIL || "admin@nursingnepal.com")
//       .trim()
//       .toLowerCase();
//     const demoPassword = String(process.env.DEMO_ADMIN_PASSWORD || "Admin@12345");

//     if (email !== demoEmail || password !== demoPassword) {
//       return NextResponse.json({ ok: false, error: "Invalid email or password" }, { status: 401 });
//     }

//     const token = signToken({ sub: "demo-admin", name: "Demo Admin", email, role: "admin" });
//     await setAuthCookie(token);
//     return NextResponse.json({ ok: true, user: { name: "Demo Admin", email, role: "admin" } });
//   }

//   await dbConnect();

//   const user = await User.findOne({ email }).lean();
//   if (!user) return NextResponse.json({ ok: false, error: "Invalid email or password" }, { status: 401 });

//   const ok = await bcrypt.compare(password, user.passwordHash || "");
//   if (!ok) return NextResponse.json({ ok: false, error: "Invalid email or password" }, { status: 401 });

//   const token = signToken({ sub: String(user._id), name: user.name, email: user.email, role: user.role || "user" });
//   await setAuthCookie(token);

//   return NextResponse.json({
//     ok: true,
//     user: { name: user.name, email: user.email, role: user.role || "user" },
//   });
// }
