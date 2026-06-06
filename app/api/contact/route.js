import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { ContactSchema } from "@/lib/validators";
import { ContactMessage } from "@/models/ContactMessage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function getTransportConfig() {
  if (process.env.MAILTRAP_HOST && process.env.MAILTRAP_USER && process.env.MAILTRAP_PASS) {
    return {
      host: process.env.MAILTRAP_HOST,
      port: Number(process.env.MAILTRAP_PORT || 2525),
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    };
  }

  if (process.env.GOOGLE_EMAIL_USER && process.env.GOOGLE_EMAIL_APP_PASSWORD) {
    return {
      service: "gmail",
      auth: {
        user: process.env.GOOGLE_EMAIL_USER,
        pass: process.env.GOOGLE_EMAIL_APP_PASSWORD,
      },
    };
  }

  return null;
}

async function sendContactEmail({ name, email, message }) {
  const transportConfig = getTransportConfig();
  const to = process.env.CONTACT_TO_EMAIL || process.env.GOOGLE_EMAIL_USER || process.env.MAILTRAP_TO_EMAIL;

  if (!transportConfig || !to) {
    return { sent: false, error: "Email env is not configured" };
  }

  const transporter = nodemailer.createTransport(transportConfig);
  const from = process.env.EMAIL_FROM || process.env.GOOGLE_EMAIL_USER || "Nursing Nepal <no-reply@nursingnepal.local>";

  try {
    await transporter.sendMail({
      from,
      to,
      replyTo: email,
      subject: parsed.data.subject?.trim()
        ? `[Nursing Nepal] ${parsed.data.subject.trim()}`
        : `New contact message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html: `
  <h2>New contact message</h2>
  <p><strong>Name:</strong> ${escapeHtml(name)}</p>
  <p><strong>Email:</strong> ${escapeHtml(email)}</p>
  <p style="white-space:pre-line">${escapeHtml(message)}</p>
      `,
    });

    return { sent: true, error: "" };
  } catch (error) {
    return { sent: false, error: error?.message || "Email sending failed" };
  }
}

export async function POST(req) {
  const body = await req.json().catch(() => null);
  const parsed = ContactSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid data" }, { status: 400 });

  if (!isDbEnabled()) {
    return NextResponse.json(
      { ok: false, error: "Contact messages require database. Set USE_DB=true." },
      { status: 503 }
    );
  }

  await dbConnect();

  const payload = {
    name: parsed.data.name.trim(),
    email: parsed.data.email.trim().toLowerCase(),
    subject: parsed.data.subject?.trim() || "",  // add
    message: parsed.data.message.trim(),
  };

  const emailResult = await sendContactEmail(payload);

  const saved = await ContactMessage.create({
    ...payload,
    emailSent: emailResult.sent,
    emailError: emailResult.error,
  });

  return NextResponse.json({
    ok: true,
    // ✅ don't mention email at all — user doesn't need to know
    message: "Thank you! Your message has been received. We will get back to you soon.",
    emailSent: emailResult.sent,
    id: String(saved._id),
  });
}
