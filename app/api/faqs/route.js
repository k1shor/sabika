import { NextResponse } from "next/server";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { Faq } from "@/models/Faq";
import { getAuthUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET — public
export async function GET() {
  if (!isDbEnabled()) return NextResponse.json({ ok: true, faqs: [] });

  await dbConnect();
  const faqs = await Faq.find().sort({ order: 1, createdAt: 1 }).lean();

  return NextResponse.json({
    ok: true,
    faqs: faqs.map((f) => ({
      _id:      String(f._id),
      question: f.question,
      answer:   f.answer,
      order:    f.order,
    })),
  });
}

// POST — admin only
export async function POST(req) {
  const user = await getAuthUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.question?.trim() || !body?.answer?.trim()) {
    return NextResponse.json({ ok: false, error: "Question and answer are required." }, { status: 400 });
  }

  await dbConnect();

  const faq = await Faq.create({
    question: body.question.trim(),
    answer:   body.answer.trim(),
    order:    body.order ?? 0,
  });

  return NextResponse.json({
    ok: true,
    faq: { _id: String(faq._id), question: faq.question, answer: faq.answer, order: faq.order },
  });
}
