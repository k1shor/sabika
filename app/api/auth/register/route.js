/**
 * POST /api/auth/register
 *
 * Handles user registration with:
 * - Field-specific Zod validation
 * - Strong password enforcement
 * - bcrypt password hashing
 * - Email verification via sendEmail (Mailtrap/Gmail)
 * - Google OAuth readiness (isVerified: true for OAuth users)
 * - Structured success/error responses
 */

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { User } from "@/models/User";
import { sendEmail } from "@/helpers/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ─── 1. Validation Schema ─────────────────────────────────────────────────────
// Zod enforces field-level rules. Each field has its own error message
// so the frontend can show exactly what's wrong per field.

const RegisterSchema = z.object({
  name: z
    .string()
    .min(2,   { message: "Name must be at least 2 characters." })
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
    .min(8,   { message: "Password must be at least 8 characters." })
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

  // Optional — set to true when registering via Google OAuth
  isOAuth: z.boolean().optional().default(false),
});

// ─── 2. Format Zod errors into field-specific object ─────────────────────────
// Turns Zod's flat error array into { name: "...", email: "...", password: "..." }
// so the frontend can map errors directly to each input field.

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

// ─── 3. Main POST handler ─────────────────────────────────────────────────────

export async function POST(req) {

  // ── 3a. Parse request body ──────────────────────────────────────────────────
  // If body is malformed JSON, catch returns null and we return 400.

  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  // ── 3b. Validate with Zod ───────────────────────────────────────────────────
  // safeParse never throws — it returns { success, data } or { success, error }.
  // On failure we return structured field errors with 400.

  const parsed = RegisterSchema.safeParse(body);

  if (!parsed.success) {
    const fieldErrors = formatZodErrors(parsed.error);
    return NextResponse.json(
      {
        ok:     false,
        error:  "Invalid input. Please fix the errors below.",
        fields: fieldErrors, // e.g. { email: "...", password: "..." }
      },
      { status: 400 }
    );
  }

  const { name, email, password, isOAuth } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();

  // ── 3c. Database check ──────────────────────────────────────────────────────
  // Abort early if DB is disabled (demo mode).
  // Then connect and check for existing user before doing anything else.

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

  // ── 3d. Check for existing account ─────────────────────────────────────────
  // 409 Conflict if email already registered.
  // For Google OAuth: if user exists, just return their info (no error).

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    // Google OAuth — user already exists, return their account
    if (isOAuth) {
      return NextResponse.json({
        ok:   true,
        user: {
          id:         String(existingUser._id),
          name:       existingUser.name,
          email:      existingUser.email,
          role:       existingUser.role,
          isVerified: existingUser.isVerified,
        },
      });
    }

    // Normal registration — email taken
    return NextResponse.json(
      {
        ok:     false,
        error:  "An account with this email already exists.",
        fields: { email: "This email is already registered." },
      },
      { status: 409 }
    );
  }

  // ── 3e. Hash password ───────────────────────────────────────────────────────
  // bcrypt with salt rounds of 12. Higher = more secure but slower.
  // Never store plain text passwords.
  // OAuth users don't have a password — store empty string.

  const passwordHash = isOAuth ? "" : await bcrypt.hash(password, 12);

  // ── 3f. Create user ─────────────────────────────────────────────────────────
  // OAuth users are pre-verified (Google already verified their email).
  // Normal users start unverified until they click the email link.

  let newUser;
  try {
    newUser = await User.create({
      name:         name.trim(),
      email:        normalizedEmail,
      passwordHash,
      role:         "visitor",        // default role
      isVerified:   isOAuth ?? false, // Google OAuth = already verified
      provider:     isOAuth ? "google" : "credentials",
    });
  } catch (err) {
    console.error("User creation failed:", err.message, err.stack);
    return NextResponse.json(
      { ok: false, error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }

  // ── 3g. Send verification email ─────────────────────────────────────────────
  // Only for normal (non-OAuth) registrations.
  // sendEmail handles token generation + DB update + Mailtrap/Gmail sending.
  // If email fails, we still return success — user can request resend later.

  if (!isOAuth) {
    try {
      await sendEmail({
        email:     newUser.email,
        emailType: "VERIFY",
        userId:    newUser._id,
      });
    } catch (err) {
      console.error("Verification email failed:", err.message, err.stack);
      // Don't block registration — user can resend from /verifyEmail page
    }
  }

  // ── 3h. Return success ──────────────────────────────────────────────────────
  // `highlight` is a short punchy message for the frontend to show prominently.
  // `message` is the longer instructional text.

  return NextResponse.json(
    {
      ok:        true,
      highlight: "Account created successfully!",
      message:   isOAuth
        ? "Signed in with Google. Welcome to Nursing Nepal!"
        : "Account created. Please check your email to verify your account before logging in.",
    },
    { status: 201 }
  );
}