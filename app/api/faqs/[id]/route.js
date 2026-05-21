import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import { Faq } from "@/models/Faq";
import { getAuthUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// PATCH — update a FAQ
export async function PATCH(req, { params }) {
  const user = await getAuthUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (!isValidId(id)) {
    return NextResponse.json({ ok: false, error: "Invalid FAQ ID." }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.question?.trim() || !body?.answer?.trim()) {
    return NextResponse.json({ ok: false, error: "Question and answer are required." }, { status: 400 });
  }

  await dbConnect();

  const faq = await Faq.findByIdAndUpdate(
    id,
    { question: body.question.trim(), answer: body.answer.trim(), order: body.order ?? 0 },
    { new: true }
  );

  if (!faq) return NextResponse.json({ ok: false, error: "FAQ not found." }, { status: 404 });

  return NextResponse.json({
    ok: true,
    faq: { _id: String(faq._id), question: faq.question, answer: faq.answer },
  });
}

// DELETE — delete a FAQ
export async function DELETE(req, { params }) {
  const user = await getAuthUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (!isValidId(id)) {
    return NextResponse.json({ ok: false, error: "Invalid FAQ ID." }, { status: 400 });
  }

  await dbConnect();

  const faq = await Faq.findByIdAndDelete(id);
  if (!faq) return NextResponse.json({ ok: false, error: "FAQ not found." }, { status: 404 });

  return NextResponse.json({ ok: true });
}