import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";

const WriterVerificationSchema = z
  .object({
    category: z.enum([
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
  })
  .superRefine((data, ctx) => {
    const licenseCategories = new Set([
      "registered_nurse",
      "nurse_working_nepal",
      "nurse_working_abroad",
    ]);

    if (licenseCategories.has(data.category) && !data.licenseNo?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["licenseNo"],
        message: "License number is required",
      });
    }

    if (
      ["nurse_working_nepal", "nurse_working_abroad"].includes(data.category) &&
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
    const auth = await requireUser();

    if (!auth.ok) {
      return NextResponse.json(
        { ok: false, error: "Login required" },
        { status: 401 }
      );
    }

    if (auth.user.role !== "blog_writer") {
      return NextResponse.json(
        { ok: false, error: "Only blog writers can apply for writer verification" },
        { status: 403 }
      );
    }

    if (auth.user.writerVerification?.status === "approved") {
      return NextResponse.json(
        { ok: false, error: "Writer is already approved" },
        { status: 409 }
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = WriterVerificationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid verification details" },
        { status: 400 }
      );
    }

    await dbConnect();

    await User.findByIdAndUpdate(auth.user.id, {
      writerVerification: {
        status: "pending",
        category: parsed.data.category,
        licenseNo: parsed.data.licenseNo?.trim() || undefined,
        workplace: parsed.data.workplace?.trim() || undefined,
        documentUrl: parsed.data.documentUrl.trim(),
        submittedAt: new Date(),
        reviewedAt: undefined,
        rejectionReason: undefined,
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Verification submitted. Please wait for admin approval.",
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Verification submission failed" },
      { status: 500 }
    );
  }
}