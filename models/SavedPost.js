import mongoose from "mongoose";

const SavedPostSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true }, // make this required
    
  },
  { timestamps: true }
);

SavedPostSchema.index({ userId: 1, postId: 1 }, { unique: true }); // use postId not slug
SavedPostSchema.index({ userId: 1, createdAt: -1 }); // for "recently saved" sorting

export const SavedPost = mongoose.models.SavedPost || mongoose.model("SavedPost", SavedPostSchema);