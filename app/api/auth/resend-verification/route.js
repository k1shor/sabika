import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { User } from "@/models/User";
import { sendEmail } from "@/helpers/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Schema = z.object({
  email: z.string().email().max(200),
});

export async function POST(req) {
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

  // 1. No account found
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "No account found with that email." },
      { status: 404 }
    );
  }

  // 2. Already verified
  if (user.isVerified) {
    return NextResponse.json(
      { ok: false, error: "This email is already verified. You can login." },
      { status: 400 }
    );
  }

  // 3. Rate limit — only allow resend if last email was sent more than 2 minutes ago
  // verifyTokenExpiry = sentAt + 1 hour, so sentAt = verifyTokenExpiry - 3600000
  if (user.verifyTokenExpiry) {
    const sentAt     = new Date(user.verifyTokenExpiry).getTime() - 60 * 60 * 1000;
    const twoMinutes = 2 * 60 * 1000;

    if (Date.now() - sentAt < twoMinutes) {
      return NextResponse.json(
        { ok: false, error: "Please wait 2 minutes before requesting another verification email." },
        { status: 429 }
      );
    }
  }

  // 4. All good — send fresh verification email
  try {
    await sendEmail({ email: user.email, emailType: "VERIFY", userId: user._id });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to send email. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, message: "Verification email sent! Check your inbox." });
}