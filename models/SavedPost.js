import mongoose from "mongoose";

const SavedPostSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    slug: { type: String, required: true },
    title: { type: String, required: true },
    excerpt: { type: String, default: "" },
  },
  { timestamps: true }
);

SavedPostSchema.index({ userId: 1, slug: 1 }, { unique: true });

export const SavedPost =
  mongoose.models.SavedPost || mongoose.model("SavedPost", SavedPostSchema);