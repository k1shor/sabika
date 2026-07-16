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
  password: z
    .string()
    .min(8)
    .max(200)
    .refine((val) => /[A-Z]/.test(val), {
      message: "Password must include at least one uppercase letter.",
    })
    .refine((val) => /[a-z]/.test(val), {
      message: "Password must include at least one lowercase letter.",
    })
    .refine((val) => /[0-9]/.test(val), {
      message: "Password must include at least one number.",
    })
    .refine((val) => /[^A-Za-z0-9]/.test(val), {
      message: "Password must include at least one special character.",
    }),
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
    // Token and password are validated by the same schema, but a
    // failure on one has nothing to do with the other -- a weak
    // password with a perfectly valid token used to return "Invalid
    // or expired reset link", which is just wrong and confusing.
    // Report the actual problem instead.
    const issues = parsed.error.issues;
    const tokenFailed = issues.some((i) => i.path[0] === "token");
    const passwordIssues = issues.filter((i) => i.path[0] === "password");

    if (tokenFailed) {
      return NextResponse.json(
        { ok: false, error: "Invalid or expired reset link" },
        { status: 400 }
      );
    }

    if (passwordIssues.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: passwordIssues[0].message,
          fields: { password: passwordIssues.map((i) => i.message) },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { ok: false, error: "Invalid request." },
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

  if (user.isBanned) {
    return NextResponse.json(
      { ok: false, error: "This account has been suspended." },
      { status: 403 }
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
  user.forgotPasswordToken = undefined;
  user.forgotPasswordTokenExpiry = undefined;
  await user.save();

  return NextResponse.json({
    ok: true,
    message: "Password updated. You can now log in.",
  });
}