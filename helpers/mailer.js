import nodemailer from "nodemailer";
import crypto from "crypto";
import { User } from "@/models/User";

export const sendEmail = async ({
  email,
  emailType,
  userId,
}) => {
  try {
    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // VERIFY EMAIL
    if (emailType === "VERIFY") {
      await User.findByIdAndUpdate(userId, {
        verifyToken: hashedToken,
        verifyTokenExpiry: Date.now() + 3600000,
      });
    }

    // RESET PASSWORD
    if (emailType === "RESET") {
      await User.findByIdAndUpdate(userId, {
        forgotPasswordToken: hashedToken,
        forgotPasswordTokenExpiry: Date.now() + 3600000,
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
        ? `${process.env.DOMAIN}/verifyEmail?token=${token}`
        : `${process.env.DOMAIN}/resetpassword?token=${token}`;

    const mailOptions = {
      from: "team@example.com",
      to: email,
      subject:
        emailType === "VERIFY"
          ? "Verify your email"
          : "Reset your password",

      html: `
        <p>
          Click <a href="${link}">here</a>
          to ${
            emailType === "VERIFY"
              ? "verify your email"
              : "reset your password"
          }
        </p>
      `,
    };

    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
    throw new Error("Email sending failed");
  }
};
