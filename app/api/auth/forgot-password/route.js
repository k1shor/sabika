import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { User } from "@/models/User";
import { assertEmailConfigured, sendPasswordResetEmail } from "@/lib/email";
import { createPasswordResetToken } from "@/lib/passwordReset";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ForgotPasswordSchema = z.object({
  email: z.string().email().max(200),
});

function getBaseUrl(req) {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "";

  if (configured) return configured.replace(/\/+$/, "");
  return new URL(req.url).origin;
}

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
    return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
  }

  if (!isDbEnabled()) {
    return NextResponse.json({ ok: false, error: "Authentication database is disabled" }, { status: 503 });
  }

  try {
    assertEmailConfigured();
  } catch {
    return NextResponse.json({ ok: false, error: "Password reset email is not configured" }, { status: 503 });
  }

  const email = parsed.data.email.trim().toLowerCase();

  await dbConnect();

  const user = await User.findOne({ email });
  if (!user) return genericResponse();

  const { token, tokenHash, expiresAt } = createPasswordResetToken();

  user.passwordResetTokenHash = tokenHash;
  user.passwordResetExpiresAt = expiresAt;
  await user.save();

  const resetUrl = `${getBaseUrl(req)}/reset-password/${token}`;

  try {
    await sendPasswordResetEmail({ to: user.email, resetUrl });
  } catch {
    user.passwordResetTokenHash = "";
    user.passwordResetExpiresAt = null;
    await user.save();

    return NextResponse.json({ ok: false, error: "Password reset email could not be sent" }, { status: 502 });
  }

  return genericResponse();
}
