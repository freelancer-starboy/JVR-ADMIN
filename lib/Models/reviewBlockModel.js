import mongoose from "mongoose";

// Customers blocked from writing reviews. Shared with the storefront (JVR/lib/Schema/reviewBlockSchema.js),
// which checks this collection before accepting a review.
const reviewBlockSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true }, // Firebase UID
    name: String,
    email: String,
    reason: { type: String, default: "" },
  },
  { timestamps: true }
);

const ReviewBlock =
  mongoose.models.ReviewBlock || mongoose.model("ReviewBlock", reviewBlockSchema, "review_blocks");

export default ReviewBlock;
