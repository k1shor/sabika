import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    
    type: {
      type: String,
      enum: [
        // Writer application flow
        "writer_application",
        "writer_approved",
        "writer_rejected",
        
        // Post flow
        "new_post",          // follower gets this when writer publishes
        "post_approved",     // writer gets this when admin approves post
        "post_rejected",     // writer gets this when admin rejects post
        "post_flagged",      // writer gets this when post is flagged
        
        // Mentor/follow system
        "new_follower",      // writer gets this when someone follows them
        
        // System
        "system",            // general announcements
      ],
      required: true,
    },
    
    message: { type: String, required: true, trim: true, maxlength: 300 },
    
    // References — all optional depending on type
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },   // better than postSlug
    postSlug: { type: String },                                        // keep for direct linking
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },  // rename from writerId — who triggered it
    
    // State
    read: { type: Boolean, default: false },
    readAt: { type: Date }, // know exactly when they read it
  },
  { timestamps: true }
);

// Fetch all unread notifications for a user fast
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);