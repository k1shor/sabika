import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 200 },
    excerpt: { type: String, default: "", trim: true, maxlength: 400 },
    content: { type: String, default: "" },
    tags: { type: [String], default: [] },
    author: { type: String, default: "Nursing Nepal" },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Post = mongoose.models.Post || mongoose.model("Post", PostSchema);
