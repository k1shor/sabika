import nodemailer from "nodemailer";
import crypto from "crypto";
import { User } from "@/models/User";

export const sendEmail = async ({ email, emailType, userId, token }) => {
  try {
    const rawToken = token || crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    if (emailType === "VERIFY") {
      await User.findByIdAndUpdate(userId, {
        verifyToken: hashedToken,
        verifyTokenExpiry: Date.now() + 60 * 60 * 1000,
      });
    }

    if (emailType === "RESET") {
      await User.findByIdAndUpdate(userId, {
        passwordResetTokenHash: hashedToken,
        passwordResetExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });

    const link =
      emailType === "VERIFY"
        ? `${process.env.DOMAIN}/verifyEmail?token=${rawToken}&email=${encodeURIComponent(email)}`
        : `${process.env.DOMAIN}/reset-password/${rawToken}`;

    const mailOptions = {
      from: "team@example.com",
      to: email,
      subject: emailType === "VERIFY" ? "Verify your email" : "Reset your password",
      html: `
        <p>
          Click <a href="${link}">here</a>
          to ${emailType === "VERIFY" ? "verify your email" : "reset your password"}
        </p>
      `,
    };

    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
    throw new Error("Email sending failed");
  }
};