import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { User } from "@/models/User";
import { generateRawToken, hashToken, tokenExpiry } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RegisterSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." })
    .max(100, { message: "Name must be under 100 characters." })
    .trim()
    .refine((val) => val.trim().split(/\s+/).length >= 2, {
      message: "Please enter your full name (first and last).",
    }),

  email: z
    .string()
    .email({ message: "Please enter a valid email address." })
    .max(200, { message: "Email is too long." }),

  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." })
    .max(200, { message: "Password is too long." })
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
      message: "Password must include at least one special character (e.g. @, #, !).",
    }),
});

function formatZodErrors(error) {
  const fields = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (field && !fields[field]) {
      fields[field] = issue.message;
    }
  }
  return fields;
}

export async function POST(req) {
  const limit = checkRateLimit(req, { name: "auth-register", limit: 5, windowMs: 60 * 60 * 1000 });
  if (!limit.ok) return rateLimitResponse(limit);

  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  const parsed = RegisterSchema.safeParse(body);

  if (!parsed.success) {
    const fieldErrors = formatZodErrors(parsed.error);
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid input. Please fix the errors below.",
        fields: fieldErrors,
      },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();

  if (!isDbEnabled()) {
    return NextResponse.json(
      { ok: false, error: "Registration is currently unavailable (demo mode)." },
      { status: 503 }
    );
  }

  try {
    await dbConnect();
  } catch (err) {
    console.error("DB connection failed:", err.message, err.stack);
    return NextResponse.json(
      { ok: false, error: "Database connection failed. Please try again." },
      { status: 500 }
    );
  }

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    if (existingUser.isBanned) {
      return NextResponse.json(
        { ok: false, error: "This account has been suspended." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: "An account with this email already exists.",
        fields: { email: "This email is already registered." },
      },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  let newUser;
  try {
    newUser = await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
      role: "visitor",
      provider: "credentials",
      isVerified: false,
      writerVerification: { status: "none" },
    });
  } catch (err) {
    console.error("User creation failed:", err.message, err.stack);
    return NextResponse.json(
      { ok: false, error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }

  // ── Send verification email ─────────────────────────────────────────────
  // Generate + hash the token, save it on the user, then send the raw
  // token as a link. If the email fails to send, registration still
  // succeeds — the user can request a resend from /verifyEmail.

  try {
    const rawToken = generateRawToken();
    newUser.verifyToken = hashToken(rawToken);
    newUser.verifyTokenExpiry = tokenExpiry();
    await newUser.save();

    const verifyUrl = `${process.env.DOMAIN}/verifyEmail?token=${rawToken}&email=${encodeURIComponent(newUser.email)}`;
    await sendVerificationEmail({ to: newUser.email, verifyUrl });
  } catch (err) {
    console.error("Verification email failed:", err.message, err.stack);
  }

  return NextResponse.json(
    {
      ok: true,
      highlight: "Account created successfully!",
      message: "Account created. Please check your email to verify your account before logging in.",
    },
    { status: 201 }
  );
}
