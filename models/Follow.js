import mongoose from "mongoose";

const FollowSchema = new mongoose.Schema(
  {
    followerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    writerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

FollowSchema.index({ followerId: 1, writerId: 1 }, { unique: true });

export const Follow =
  mongoose.models.Follow || mongoose.model("Follow", FollowSchema);