import nodemailer from "nodemailer";

function getMailConfig() {
  const user = process.env.GOOGLE_EMAIL_USER || "";
  const pass = process.env.GOOGLE_EMAIL_APP_PASSWORD || "";

  if (!user || !pass) {
    throw new Error("Google email credentials are not configured");
  }

  return {
    user,
    pass,
    from: process.env.EMAIL_FROM || `Nursing Nepal <${user}>`,
  };
}

export function assertEmailConfigured() {
  getMailConfig();
}

function getTransporter() {
  const { user, pass } = getMailConfig();

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendPasswordResetEmail({ to, resetUrl }) {
  const { from } = getMailConfig();
  const transporter = getTransporter();
  const safeResetUrl = escapeHtml(resetUrl);

  await transporter.sendMail({
    from,
    to,
    subject: "Reset your Nursing Nepal password",
    text: [
      "We received a request to reset your Nursing Nepal password.",
      "",
      `Reset your password here: ${resetUrl}`,
      "",
      "This link expires in 1 hour. If you did not request this, you can ignore this email.",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <h2 style="margin: 0 0 12px;">Reset your Nursing Nepal password</h2>
        <p>We received a request to reset your password.</p>
        <p>
          <a href="${safeResetUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:10px;font-weight:700;">
            Reset Password
          </a>
        </p>
        <p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });
}

export async function sendVerificationEmail({ to, verifyUrl }) {
  const { from } = getMailConfig();
  const transporter = getTransporter();
  const safeVerifyUrl = escapeHtml(verifyUrl);

  await transporter.sendMail({
    from,
    to,
    subject: "Verify your Nursing Nepal email",
    text: [
      "Thanks for signing up for Nursing Nepal.",
      "",
      `Verify your email here: ${verifyUrl}`,
      "",
      "This link expires in 1 hour. If you did not create this account, you can ignore this email.",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <h2 style="margin: 0 0 12px;">Verify your email</h2>
        <p>Thanks for signing up for Nursing Nepal.</p>
        <p>
          <a href="${safeVerifyUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:10px;font-weight:700;">
            Verify Email
          </a>
        </p>
        <p>This link expires in 1 hour. If you did not create this account, you can ignore this email.</p>
      </div>
    `,
  });
}
export async function sendContactReplyEmail({ to, originalSubject, originalMessage, replyMessage }) {
  const { from } = getMailConfig();
  const transporter = getTransporter();

  const subject = originalSubject
    ? `Re: ${originalSubject}`
    : "Re: Your message to Nursing Nepal";

  await transporter.sendMail({
    from,
    to,
    subject,
    text: [
      replyMessage,
      "",
      "---",
      "Your original message:",
      originalMessage || "",
    ].join("\\n"),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <p style="white-space: pre-line;">${escapeHtml(replyMessage)}</p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e2e8f0;" />
        <p style="color: #64748b; font-size: 13px;"><strong>Your original message:</strong></p>
        <p style="color: #64748b; font-size: 13px; white-space: pre-line;">${escapeHtml(originalMessage || "")}</p>
      </div>
    `,
  });
}