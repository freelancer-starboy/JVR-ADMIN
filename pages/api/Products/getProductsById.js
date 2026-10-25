import connectDb from "lib/database/db";
import Product from "lib/Models/AddProduct";
import Review from "lib/Models/reviewModel";
import { isValidObjectId, rejectMethod, sendError } from "lib/http";

export default async function handler(req, res) {
  if (rejectMethod(req, res, ["POST"])) return;

  const { productId } = req.body || {};
  if (!isValidObjectId(productId)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  try {
    await connectDb();

    const product = await Product.findById(productId).lean();
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const reviews = await Review.find({ productId }).sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      message: "Product fetched successfully",
      product,
      reviews,
    });
  } catch (error) {
    return sendError(res, error, "Failed to load product");
  }
}
