import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    actorName: { type: String, default: "", trim: true, maxlength: 120 },
    actorEmail: { type: String, default: "", trim: true, lowercase: true, maxlength: 200 },
    action: { type: String, required: true, trim: true, maxlength: 120, index: true },
    targetType: { type: String, required: true, trim: true, maxlength: 80, index: true },
    targetId: { type: String, default: "", trim: true, maxlength: 120, index: true },
    targetLabel: { type: String, default: "", trim: true, maxlength: 220 },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    ip: { type: String, default: "", trim: true, maxlength: 120 },
    userAgent: { type: String, default: "", trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

AuditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);
