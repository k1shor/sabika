import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    // Basic
    title:       { type: String, required: true, trim: true, maxlength: 160 },
    slug:        { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 200 },
    excerpt:     { type: String, default: "", trim: true, maxlength: 400 },
    contentHtml: { type: String, required: true },

    // Media
    coverImage: { type: String, default: "" },
    images:     { type: [String], default: [] },

    // Author
    authorId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    author:      { type: String, default: "Nursing Nepal" },
    isAnonymous: { type: Boolean, default: false },

    // Categorization
    category: {
      type: String,
      enum: ["entrance_pass", "nursing_student", "working_nurse", "abroad_study", "abroad_work"],
      required: true,
    },
    postType: {
      type: String,
      enum: ["normal", "reality_check", "hospital_diary", "country_pathway"],
      default: "normal",
    },

    // FIX 1: removed enum — tags are free-text, writers shouldn't be
    // constrained to 7 hardcoded values. Validate length only.
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.every((t) => t.length <= 40),
        message: "Each tag must be 40 characters or fewer",
      },
    },

    // Moderation
    status: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected"],
      // FIX 2: approved by default so posts are immediately visible.
      // Change to "pending" if you want admin review before publishing.
      default: "approved",
    },
    isFlagged:       { type: Boolean, default: false },
    flaggedReason:   { type: String, default: "", maxlength: 500 },
    rejectionReason: { type: String, default: "", maxlength: 500 },

    // Engagement
    views:      { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },

    // Meta
    readTime:    { type: String, default: "5 min read" },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);
export const Post = mongoose.models.Post || mongoose.model("Post", PostSchema);