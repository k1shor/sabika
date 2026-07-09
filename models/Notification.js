import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    type: {
      type: String,
      enum: [
        "writer_application",
        "writer_approved",
        "writer_rejected",
        "new_post",
        "post_pending_review",
        "post_approved",
        "post_rejected",
        "post_flagged",
        "new_follower",
        "system",
      ],
      required: true,
    },

    message: { type: String, required: true, trim: true, maxlength: 300 },

    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    postSlug: { type: String },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    read: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);