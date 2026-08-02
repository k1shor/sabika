import mongoose from "mongoose";

const REPORT_REASONS = [
  "medical_misinformation",
  "spam",
  "harassment",
  "fake_credentials",
  "unsafe_advice",
  "other",
];

const ReportSchema = new mongoose.Schema(
  {
    reporterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    targetType: { type: String, enum: ["post", "writer"], required: true, index: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    targetLabel: { type: String, default: "", trim: true, maxlength: 220 },
    reason: { type: String, enum: REPORT_REASONS, required: true, index: true },
    details: { type: String, default: "", trim: true, maxlength: 1000 },
    status: { type: String, enum: ["open", "reviewed", "dismissed", "action_taken"], default: "open", index: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,
    adminNotes: { type: String, default: "", trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

ReportSchema.index({ reporterId: 1, targetType: 1, targetId: 1 }, { unique: true });
ReportSchema.index({ createdAt: -1 });

export const REPORT_REASON_VALUES = REPORT_REASONS;
export const Report = mongoose.models.Report || mongoose.model("Report", ReportSchema);
