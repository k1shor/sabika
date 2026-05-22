import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 200 },
    // FIXED — not required for Google OAuth users
    passwordHash: { type: String, default: "" },
    provider: { type: String, enum: ["credentials", "google"], default: "credentials" },
    role: { type: String, enum: ["visitor", "blog_writer", "admin"], default: "visitor" },
    isVerified: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    writerVerification: {
      status: {
        type: String,
        enum: ["none", "pending", "approved", "rejected"],
        default: "none",
      },
      category: {
        type: String,
        enum: [
          "entrance_exam_passed",
          "nursing_student",
          "registered_nurse",
          "nurse_working_nepal",
          "nurse_studying_abroad",
          "nurse_working_abroad",
        ],
      },
      licenseNo: { type: String, trim: true, maxlength: 80 },
      workplace: { type: String, trim: true, maxlength: 160 },
      documentUrl: { type: String, trim: true, maxlength: 500 },
      submittedAt: Date,
      reviewedAt: Date,
      rejectionReason: { type: String, trim: true, maxlength: 500 },
    },
    forgotPasswordToken: String,
    forgotPasswordTokenExpiry: Date,
    verifyToken: String,
    verifyTokenExpiry: Date

  },

  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
