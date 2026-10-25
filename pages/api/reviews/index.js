import connectDb from "lib/database/db";
import Review from "lib/Models/reviewModel";
import ReviewBlock from "lib/Models/reviewBlockModel";
import "lib/Models/AddProduct"; // registers the Product model for populate()
import { escapeRegex, rejectMethod, sendError, toPositiveInt } from "lib/http";

// GET /api/reviews?q=&rating=&page=&limit=
// Every product review, newest first, with the product and whether the author is blocked.
export default async function handler(req, res) {
  if (rejectMethod(req, res, ["GET"])) return;

  const page = toPositiveInt(req.query.page, 1);
  const limit = toPositiveInt(req.query.limit, 20, 100);
  const rating = toPositiveInt(req.query.rating, 0, 5);
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

  const filter = {};
  if (rating) filter.rating = rating;
  if (q) {
    const regex = { $regex: escapeRegex(q), $options: "i" };
    filter.$or = [{ user: regex }, { userEmail: regex }, { comment: regex }];
  }

  try {
    await connectDb();

    const [reviews, total, blocks] = await Promise.all([
      Review.find(filter)
        .populate("productId", "productName productVariants.images")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Review.countDocuments(filter),
      ReviewBlock.find({}, { userId: 1 }).lean(),
    ]);

    const blocked = new Set(blocks.map((block) => block.userId));

    return res.status(200).json({
      reviews: reviews.map(({ productId: product, ...review }) => ({
        ...review,
        product: product
          ? {
              _id: product._id,
              productName: product.productName,
              image: product.productVariants?.[0]?.images?.[0] || null,
            }
          : null,
        isBlocked: Boolean(review.userId && blocked.has(review.userId)),
      })),
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      blockedCount: blocked.size,
    });
  } catch (error) {
    return sendError(res, error, "Failed to load reviews");
  }
}
