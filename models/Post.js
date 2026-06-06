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
    authorId:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isAnonymous:    { type: Boolean, default: false },
    isOfficialPost: { type: Boolean, default: false }, // ✅ admin posts show as "Nursing Nepal"

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

    // Flair
    flair: {
      type: String,
      enum: ["", "tips", "tricks", "guidance", "clinical_experience", "career_journey", "workplace_reality", "story"],
      default: "",
    },

    // Free text tags — max 5
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 5 && arr.every((t) => t.length <= 40),
        message: "Max 5 tags, each under 40 characters",
      },
    },

    // Moderation
    status:          { type: String, enum: ["draft", "pending", "approved", "rejected"], default: "draft" },
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