import mongoose from "mongoose";

const ContactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 200 },
    subject: { type: String, default: "", trim: true, maxlength: 200 }, // add this
    message: { type: String, required: true, trim: true, maxlength: 3000 },
    
    // Email delivery
    emailSent: { type: Boolean, default: false },
    emailError: { type: String, default: "", maxlength: 500 },
    
    // Admin handling
    read: { type: Boolean, default: false },
    repliedAt: { type: Date }, // add this - know if admin replied
    adminNotes: { type: String, default: "", maxlength: 500 }, // add this - internal notes
  },
  { timestamps: true }
);

export const ContactMessage =
  mongoose.models.ContactMessage ||
  mongoose.model("ContactMessage", ContactMessageSchema);