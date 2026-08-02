import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { User } from "@/models/User";
import { generateRawToken, hashToken, tokenExpiry } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";

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
  const limit = checkRateLimit(req, { name: "auth-forgot-password", limit: 5, windowMs: 60 * 60 * 1000 });
  if (!limit.ok) return rateLimitResponse(limit);

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
    const rawToken = generateRawToken();
    user.passwordResetTokenHash = hashToken(rawToken);
    user.passwordResetExpiresAt = tokenExpiry();
    await user.save();

    const resetUrl = `${process.env.DOMAIN}/reset-password/${rawToken}`;
    await sendPasswordResetEmail({ to: user.email, resetUrl });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Password reset email could not be sent" },
      { status: 502 }
    );
  }

  return genericResponse();
}
