import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/auth";
import { dbConnect,isDbEnabled } from "@/lib/db";
import { User } from "@/models/User";
import { Notification } from "@/models/Notification";

const WriterApplicationSchema = z.object({
  writerCategory: z.enum([
    "entrance_exam_passed",
    "nursing_student",
    "registered_nurse",
    "nurse_working_nepal",
    "nurse_studying_abroad",
    "nurse_working_abroad",
  ]),
  licenseNo: z.string().max(80).optional(),
  workplace: z.string().max(160).optional(),
  documentUrl: z.string().min(3).max(500),
}).superRefine((data, ctx) => {
  const licenseCategories = new Set([
    "registered_nurse",
    "nurse_working_nepal",
    "nurse_working_abroad",
  ]);

  if (licenseCategories.has(data.writerCategory) && !data.licenseNo?.trim()) {
    ctx.addIssue({
      code: "custom",
      path: ["licenseNo"],
      message: "License number is required",
    });
  }

  if (
    ["nurse_working_nepal", "nurse_working_abroad"].includes(data.writerCategory) &&
    !data.workplace?.trim()
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["workplace"],
      message: "Workplace is required",
    });
  }
});

export async function POST(req) {
  try {
    const authUser = await getAuthUser();

    if (!authUser) {
      return NextResponse.json(
        { ok: false, error: "Please login first" },
        { status: 401 }
      );
    }

    if (!authUser.isVerified) {
      return NextResponse.json(
        { ok: false, error: "Please verify your email before applying" },
        { status: 403 }
      );
    }

    if (authUser.role !== "blog_writer") {
      return NextResponse.json(
        { ok: false, error: "Only blog writer accounts can apply for writer approval" },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = WriterApplicationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid writer application" },
        { status: 400 }
      );
    }
    if (!isDbEnabled()) {
      return NextResponse.json(
        { ok: false, error: "Service unavailable." },
        { status: 503 }
      );
    }
    await dbConnect();

    const user = await User.findById(authUser.id);

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "User not found" },
        { status: 404 }
      );
    }

    if (user.writerVerification?.status === "approved") {
      return NextResponse.json(
        { ok: false, error: "Your writer account is already approved. You can post now." },
        { status: 400 }
      );
    }

    if (user.writerVerification?.status === "pending") {
      return NextResponse.json(
        { ok: false, error: "Your writer application is already pending admin review." },
        { status: 400 }
      );
    }

    user.writerVerification = {
      status: "pending",
      category: parsed.data.writerCategory,
      licenseNo: parsed.data.licenseNo?.trim() || undefined,
      workplace: parsed.data.workplace?.trim() || undefined,
      documentUrl: parsed.data.documentUrl.trim(),
      submittedAt: new Date(),
      rejectionReason: undefined,
    };

    await user.save();

    const admins = await User.find({ role: "admin" }, { _id: 1 }).lean();
    if (admins.length > 0) {
      await Notification.insertMany(
        admins.map((admin) => ({
          userId: admin._id,
          actorId: user._id,
          type: "writer_application",
          message: `${user.name || user.email} submitted a writer application for admin review.`,
          read: false,
        }))
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Writer application submitted. Please wait for admin approval.",
    });
  } catch (err) {
    console.error("Apply writer error:", err.message, err.stack);
    return NextResponse.json(
      { ok: false, error: err.message || "Writer application submission failed" },
      { status: 500 }
    );
  }
}
