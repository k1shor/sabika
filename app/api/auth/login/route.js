import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import jwt from "jsonwebtoken";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(req) {
  const body = await req.json();

  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  await dbConnect();

  const { email, password } = parsed.data;

  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  if (!user.isVerified) {
    return NextResponse.json(
      { error: "Please verify your email first" },
      { status: 403 }
    );
  }
  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  const res = NextResponse.json({
    message: "Login success",
    success: true,
  });

  res.cookies.set("token", token, {
    httpOnly: true,
    path: "/",
  });
  
  return res;
}