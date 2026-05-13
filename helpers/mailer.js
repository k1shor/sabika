import nodemailer from "nodemailer";
import bcryptjs from "bcryptjs";
import { User } from "@/models/User";

export const sendEmail = async ({
  email,
  emailType,
  userId,
}) => {
  try {
    const hashedToken = await bcryptjs.hash(
      userId.toString(),
      10
    );

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
        ? `${process.env.DOMAIN}/verifyemail?token=${hashedToken}`
        : `${process.env.DOMAIN}/resetpassword?token=${hashedToken}`;

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