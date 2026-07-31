import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { User } from "@/models/User";
import { generateRawToken, hashToken, tokenExpiry, TOKEN_TTL_MS } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Schema = z.object({
  email: z.string().email().max(200),
});

export async function POST(req) {
  const limit = checkRateLimit(req, { name: "auth-resend-verification", limit: 3, windowMs: 10 * 60 * 1000 });
  if (!limit.ok) return rateLimitResponse(limit);

  const body   = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid email address." }, { status: 400 });
  }

  if (!isDbEnabled()) {
    return NextResponse.json({ ok: false, error: "Database is disabled." }, { status: 503 });
  }

  await dbConnect();

  const email = parsed.data.email.trim().toLowerCase();
  const user  = await User.findOne({ email });

  if (!user) {
    return NextResponse.json(
      { ok: false, error: "No account found with that email." },
      { status: 404 }
    );
  }

  if (user.isVerified) {
    return NextResponse.json(
      { ok: false, error: "This email is already verified. You can login." },
      { status: 400 }
    );
  }

  if (user.isBanned) {
    return NextResponse.json(
      { ok: false, error: "This account has been suspended." },
      { status: 403 }
    );
  }

  // Rate limit — only allow resend if the last token was issued more than
  // 2 minutes ago. verifyTokenExpiry = sentAt + TOKEN_TTL_MS, so we back
  // out sentAt from it (JS-side arithmetic, unaffected by how Mongo
  // stores/queries the field).
  if (user.verifyTokenExpiry) {
    const sentAt     = new Date(user.verifyTokenExpiry).getTime() - TOKEN_TTL_MS;
    const twoMinutes = 2 * 60 * 1000;

    if (Date.now() - sentAt < twoMinutes) {
      return NextResponse.json(
        { ok: false, error: "Please wait 2 minutes before requesting another verification email." },
        { status: 429 }
      );
    }
  }

  try {
    const rawToken = generateRawToken();
    user.verifyToken = hashToken(rawToken);
    user.verifyTokenExpiry = tokenExpiry();
    await user.save();

    const verifyUrl = `${process.env.DOMAIN}/verifyEmail?token=${rawToken}&email=${encodeURIComponent(user.email)}`;
    await sendVerificationEmail({ to: user.email, verifyUrl });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to send email. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, message: "Verification email sent! Check your inbox." });
}
