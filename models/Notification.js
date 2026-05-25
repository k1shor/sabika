import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["new_post"], required: true },
    message: { type: String, required: true },
    postSlug: String,
    writerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);