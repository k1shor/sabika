import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { User } from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PasswordChangeSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required." }),
  newPassword: z
    .string()
    .min(8,   { message: "Password must be at least 8 characters." })
    .max(200, { message: "Password is too long." })
    .refine((val) => /[A-Z]/.test(val), { message: "Must include an uppercase letter." })
    .refine((val) => /[a-z]/.test(val), { message: "Must include a lowercase letter." })
    .refine((val) => /[0-9]/.test(val), { message: "Must include a number." })
    .refine((val) => /[^A-Za-z0-9]/.test(val), { message: "Must include a special character." }),
});

export async function PATCH(req) {
  try {
    const auth = await requireUser();
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: "Login required" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
    }

    const parsed = PasswordChangeSchema.safeParse(body);
    if (!parsed.success) {
      const fields = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field && !fields[field]) fields[field] = issue.message;
      }
      return NextResponse.json({ ok: false, error: "Invalid input", fields }, { status: 400 });
    }

    if (!isDbEnabled()) {
      return NextResponse.json({ ok: false, error: "Service unavailable." }, { status: 503 });
    }

    await dbConnect();

    const user = await User.findById(auth.user.id);
    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    if (user.provider === "google") {
      return NextResponse.json(
        { ok: false, error: "Google accounts cannot change password here." },
        { status: 400 }
      );
    }

    const isMatch = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash || "");
    if (!isMatch) {
      return NextResponse.json(
        { ok: false, error: "Current password is incorrect.", fields: { currentPassword: "Incorrect password." } },
        { status: 401 }
      );
    }

    const isSame = await bcrypt.compare(parsed.data.newPassword, user.passwordHash || "");
    if (isSame) {
      return NextResponse.json(
        { ok: false, error: "New password must be different from current password." },
        { status: 400 }
      );
    }

    user.passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
    await user.save();

    return NextResponse.json({
      ok: true,
      message: "Password updated successfully.",
    });
  } catch (err) {
    console.error("PATCH /api/profile/password:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}