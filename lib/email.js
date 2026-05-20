// import nodemailer from "nodemailer";

// function getMailConfig() {
//   const user = process.env.GOOGLE_EMAIL_USER || "";
//   const pass = process.env.GOOGLE_EMAIL_APP_PASSWORD || "";

//   if (!user || !pass) {
//     throw new Error("Google email credentials are not configured");
//   }

//   return {
//     user,
//     pass,
//     from: process.env.EMAIL_FROM || `Nursing Nepal <${user}>`,
//   };
// }

// export function assertEmailConfigured() {
//   getMailConfig();
// }

// function getTransporter() {
//   const { user, pass } = getMailConfig();

//   return nodemailer.createTransport({
//     service: "gmail",
//     auth: { user, pass },
//   });
// }

// function escapeHtml(value) {
//   return String(value || "")
//     .replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;")
//     .replace(/"/g, "&quot;");
// }

// export async function sendPasswordResetEmail({ to, resetUrl }) {
//   const { from } = getMailConfig();
//   const transporter = getTransporter();
//   const safeResetUrl = escapeHtml(resetUrl);

//   await transporter.sendMail({
//     from,
//     to,
//     subject: "Reset your Nursing Nepal password",
//     text: [
//       "We received a request to reset your Nursing Nepal password.",
//       "",
//       `Reset your password here: ${resetUrl}`,
//       "",
//       "This link expires in 1 hour. If you did not request this, you can ignore this email.",
//     ].join("\n"),
//     html: `
//       <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
//         <h2 style="margin: 0 0 12px;">Reset your Nursing Nepal password</h2>
//         <p>We received a request to reset your password.</p>
//         <p>
//           <a href="${safeResetUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:10px;font-weight:700;">
//             Reset Password
//           </a>
//         </p>
//         <p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
//       </div>
//     `,
//   });
// }
