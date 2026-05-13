import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";

export async function POST(req) {
  const { token } = await req.json();

  await dbConnect();

  const user = await User.findOne({
    verifyToken: token,
    verifyTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  user.isVerified = true;
  user.verifyToken = undefined;
  user.verifyTokenExpiry = undefined;

  await user.save();

  return NextResponse.json({
    message: "Email verified",
    success: true,
  });
}