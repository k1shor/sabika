import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { User } from "@/models/User";
import { sendEmail } from "@/helpers/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RegisterSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(200),
  password: z.string().min(6).max(200),
  role: z.enum(["visitor", "blog_writer"]).default("visitor"),
});

function isDemoAuthEnabled() {
  return String(process.env.DEMO_AUTH).toLowerCase() === "true";
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => null);

    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid input" },
        { status: 400 }
      );
    }

    const name = parsed.data.name.trim();
    const email = parsed.data.email.trim().toLowerCase();
    const password = parsed.data.password;
    const role = parsed.data.role;

    await dbConnect();

    const exists = await User.findOne({ email });

    if (exists) {
      return NextResponse.json(
        { ok: false, error: "Email already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      isVerified: false,
      writerVerification: { status: "none" },
    });

    await sendEmail({
      email,
      emailType: "VERIFY",
      userId: user._id,
    });

    return NextResponse.json({
      ok: true,
      message: "Registered successfully. Check your email to verify account.",
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Registration failed",
      },
      { status: 500 }
    );
  }

  const name = parsed.data.name.trim();
  const email = parsed.data.email.trim().toLowerCase();
  const password = parsed.data.password;

  if (!isDbEnabled()) {
    if (!isDemoAuthEnabled()) {
      return NextResponse.json({ ok: false, error: "Authentication database is disabled" }, { status: 503 });
    }

    const token = signToken({ sub: "demo-user", name, email, role: "user" });
    await setAuthCookie(token);
    return NextResponse.json({ ok: true, user: { name, email, role: "user" } });
  }

  await dbConnect();

  const exists = await User.findOne({ email }).lean();
  if (exists) {
    return NextResponse.json({ ok: false, error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    passwordHash,
    role: "user",
  });

  const token = signToken({ sub: String(user._id), name: user.name, email: user.email, role: user.role });
  await setAuthCookie(token);

  return NextResponse.json({
    ok: true,
    user: { name: user.name, email: user.email, role: user.role },
  });
}
