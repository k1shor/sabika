import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { User } from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ResetPasswordSchema = z.object({
  token: z.string().length(64).regex(/^[a-f0-9]+$/i),
  password: z.string().min(8).max(200),
});

function hashToken(token) {
  return crypto
    .createHash("sha256")
    .update(String(token || ""))
    .digest("hex");
}

export async function POST(req) {
  const body = await req.json().catch(() => null);
  const parsed = ResetPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid or expired reset link" },
      { status: 400 }
    );
  }

  if (!isDbEnabled()) {
    return NextResponse.json(
      { ok: false, error: "Authentication database is disabled" },
      { status: 503 }
    );
  }

  await dbConnect();

  const tokenHash = hashToken(parsed.data.token);

  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: { $gt: new Date() },
  });

  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Invalid or expired reset link" },
      { status: 400 }
    );
  }

  if (user.provider === "google") {
    return NextResponse.json(
      { ok: false, error: "Use Google sign in for this account." },
      { status: 400 }
    );
  }

  user.passwordHash = await bcrypt.hash(parsed.data.password, 12);
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpiresAt = undefined;

  await user.save();

  return NextResponse.json({
    ok: true,
    message: "Password updated. You can now log in.",
  });
}