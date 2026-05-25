import { NextResponse } from "next/server";
import crypto from "crypto";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => null);
    const token = body?.token;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { ok: false, error: "Verification token is required" },
        { status: 400 }
      );
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    await dbConnect();

    const user = await User.findOne({
      verifyToken: hashedToken,
      verifyTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Invalid or expired token" },
        { status: 400 }
      );
    }
    if (user.isVerified) {
      return NextResponse.json({
        ok: true,
        message: "Your email is already verified. You can login now.",
      });
    }

    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpiry = undefined;

    await user.save();

    return NextResponse.json({
      ok: true,
      message: "Email verified",
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Email verification failed" },
      { status: 500 }
    );
  }
}
