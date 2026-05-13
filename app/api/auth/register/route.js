import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { sendEmail } from "@/helpers/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RegisterSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(200),
  password: z.string().min(6).max(200),
});

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
      role: "user",
      isVerified: false,
    });

    await sendEmail({
      email,
      emailType: "VERIFY",
      userId: user._id,
    });

    return NextResponse.json({
      ok: true,
      message: "User registered. Check email to verify account.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}