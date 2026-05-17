import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { User } from "@/models/User";
import { signToken, setAuthCookie } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LoginSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(1).max(200),
});

function isDemoAuthEnabled() {
  return String(process.env.DEMO_AUTH).toLowerCase() === "true";
}

export async function POST(req) {
  const body = await req.json().catch(() => null);
  const parsed = LoginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const password = parsed.data.password;

  if (!isDbEnabled()) {
    if (!isDemoAuthEnabled()) {
      return NextResponse.json({ ok: false, error: "Authentication database is disabled" }, { status: 503 });
    }

    const demoEmail = String(process.env.DEMO_ADMIN_EMAIL || "admin@nursingnepal.com")
      .trim()
      .toLowerCase();
    const demoPassword = String(process.env.DEMO_ADMIN_PASSWORD || "Admin@12345");

    if (email !== demoEmail || password !== demoPassword) {
      return NextResponse.json({ ok: false, error: "Invalid email or password" }, { status: 401 });
    }

    const token = signToken({ sub: "demo-admin", name: "Demo Admin", email, role: "admin" });
    await setAuthCookie(token);
    return NextResponse.json({ ok: true, user: { name: "Demo Admin", email, role: "admin" } });
  }

  await dbConnect();

  const user = await User.findOne({ email }).lean();
  if (!user) return NextResponse.json({ ok: false, error: "Invalid email or password" }, { status: 401 });

  const ok = await bcrypt.compare(password, user.passwordHash || "");
  if (!ok) return NextResponse.json({ ok: false, error: "Invalid email or password" }, { status: 401 });

  const token = signToken({ sub: String(user._id), name: user.name, email: user.email, role: user.role || "user" });
  await setAuthCookie(token);

  return NextResponse.json({
    ok: true,
    user: { name: user.name, email: user.email, role: user.role || "user" },
  });
}
