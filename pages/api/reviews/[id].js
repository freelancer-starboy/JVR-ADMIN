import connectDb from "lib/database/db";
import Review from "lib/Models/reviewModel";
import { deleteImages } from "lib/cloudinary";
import { isValidObjectId, rejectMethod, sendError } from "lib/http";

// DELETE /api/reviews/:id -> removes the review and its photos
export default async function handler(req, res) {
  if (rejectMethod(req, res, ["DELETE"])) return;

  const { id } = req.query;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid review ID" });
  }

  try {
    await connectDb();
    const review = await Review.findByIdAndDelete(id).lean();
    if (!review) return res.status(404).json({ message: "Review not found" });

    await deleteImages(review.imageUrls);
    return res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    return sendError(res, error, "Failed to delete review");
  }
}
