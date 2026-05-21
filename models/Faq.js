import mongoose from "mongoose";

const FaqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    answer:   { type: String, required: true, trim: true },
    order:    { type: Number, default: 0 }, // for custom ordering
  },
  { timestamps: true }
);

export const Faq = mongoose.models.Faq || mongoose.model("Faq", FaqSchema);