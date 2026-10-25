import connectDb from "lib/database/db";
import Review from "lib/Models/reviewModel";
import ReviewBlock from "lib/Models/reviewBlockModel";
import { deleteImages } from "lib/cloudinary";
import { rejectMethod, sendError } from "lib/http";

const MAX_REASON_LENGTH = 500;

// GET    /api/reviews/blocks                       -> blocked customers, newest first (with review counts)
// POST   /api/reviews/blocks { userId, reason?, deleteReviews? } -> block a customer
// DELETE /api/reviews/blocks?userId=...            -> unblock
export default async function handler(req, res) {
  if (rejectMethod(req, res, ["GET", "POST", "DELETE"])) return;

  try {
    await connectDb();

    if (req.method === "GET") {
      const blocks = await ReviewBlock.find().sort({ createdAt: -1 }).lean();
      const counts = await Review.aggregate([
        { $match: { userId: { $in: blocks.map((block) => block.userId) } } },
        { $group: { _id: "$userId", count: { $sum: 1 } } },
      ]);
      const countByUser = Object.fromEntries(counts.map((row) => [row._id, row.count]));
      return res.status(200).json({
        blocks: blocks.map((block) => ({ ...block, reviewCount: countByUser[block.userId] || 0 })),
      });
    }

    if (req.method === "DELETE") {
      const userId = typeof req.query.userId === "string" ? req.query.userId : "";
      if (!userId) return res.status(400).json({ message: "User ID is required" });
      await ReviewBlock.deleteOne({ userId });
      return res.status(200).json({ message: "Customer can write reviews again" });
    }

    // POST
    const { userId, reason = "", deleteReviews = false } = req.body || {};
    if (typeof userId !== "string" || !userId.trim()) {
      return res.status(400).json({ message: "User ID is required" });
    }
    if (typeof reason !== "string" || reason.length > MAX_REASON_LENGTH) {
      return res.status(400).json({ message: `Reason must be text up to ${MAX_REASON_LENGTH} characters` });
    }

    // Take the name/email from the customer's latest review
    const latest = await Review.findOne({ userId }).sort({ createdAt: -1 }).lean();
    if (!latest) {
      return res.status(404).json({ message: "No reviews found for this customer" });
    }

    await ReviewBlock.updateOne(
      { userId },
      { $set: { name: latest.user, email: latest.userEmail, reason: reason.trim() } },
      { upsert: true }
    );

    let deleted = 0;
    if (deleteReviews) {
      const reviews = await Review.find({ userId }, { imageUrls: 1 }).lean();
      const result = await Review.deleteMany({ userId });
      deleted = result.deletedCount || 0;
      await deleteImages(reviews.flatMap((review) => review.imageUrls || []));
    }

    return res.status(200).json({
      message: deleted
        ? `Customer blocked and ${deleted} review${deleted === 1 ? "" : "s"} deleted`
        : "Customer blocked from writing reviews",
    });
  } catch (error) {
    return sendError(res, error, "Failed to update review access");
  }
}
