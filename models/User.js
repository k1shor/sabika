import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    // Basic Info
    name: { type: String, required: true, trim: true, maxlength: 80 },
    username: { type: String, unique: true, sparse: true, lowercase: true, trim: true, maxlength: 40 }, // for profile URLs
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 200 },
    passwordHash: { type: String, default: "" },
    provider: { type: String, enum: ["credentials", "google"], default: "credentials" },

    // Profile Display
    avatarUrl: { type: String, default: "" },
    bio: { type: String, default: "", trim: true, maxlength: 300 },

    // Social Links
    twitter: { type: String, default: "", trim: true, maxlength: 100 },
    phone: { type: String, default: "", trim: true, maxlength: 20 },
    website: { type: String, default: "", trim: true, maxlength: 200 },

    // Role & Access
    role: { type: String, enum: ["visitor", "blog_writer", "admin"], default: "visitor" },
    isVerified: { type: Boolean, default: false }, // email verified
    isAdmin: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    bannedAt: { type: Date },
    bannedReason: { type: String, default: "", maxlength: 300 },

    // Trust Badge (display badge shown on profile/posts)
    badge: {
      type: String,
      enum: ["", "nursing_student", "registered_nurse", "abroad_nurse", "mentor"],
      default: "",
    },

    // Writer Verification
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
      adminNotes: { type: String, trim: true, maxlength: 500 }, // internal admin notes
    },

    // Cached Stats (avoids expensive queries on profile load)
    stats: {
      totalBlogs: { type: Number, default: 0 },
      totalFollowers: { type: Number, default: 0 },
      totalFollowing: { type: Number, default: 0 },
    },

    // Password Reset & Email Verification Tokens
    forgotPasswordToken: String,
    forgotPasswordTokenExpiry: Date,
    verifyToken: String,
    verifyTokenExpiry: Date,
    passwordResetTokenHash: String,
    passwordResetExpiresAt: Date,
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model("User", UserSchema);