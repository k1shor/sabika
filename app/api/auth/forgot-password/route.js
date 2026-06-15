import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { User } from "@/models/User";
import { sendEmail } from "@/helpers/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ForgotPasswordSchema = z.object({
  email: z.string().email().max(200),
});

function genericResponse() {
  return NextResponse.json({
    ok: true,
    message: "If that email is registered, a password reset link has been sent.",
  });
}

export async function POST(req) {
  const body = await req.json().catch(() => null);
  const parsed = ForgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
  }

  if (!isDbEnabled()) {
    return genericResponse();
  }

  await dbConnect();

  const email = parsed.data.email.trim().toLowerCase();
  const user = await User.findOne({ email });

  if (!user) {
    return genericResponse();
  }

  if (user.provider === "google") {
    return genericResponse();
  }

  try {
    await sendEmail({
      email: user.email,
      emailType: "RESET",
      userId: user._id,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Password reset email could not be sent" },
      { status: 502 }
    );
  }

  return genericResponse();
}