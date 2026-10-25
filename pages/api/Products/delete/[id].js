import connectDb from "lib/database/db";
import Product from "lib/Models/AddProduct";
import Review from "lib/Models/reviewModel";
import { deleteImages } from "lib/cloudinary";
import { isValidObjectId, rejectMethod, sendError } from "lib/http";

export default async function handler(req, res) {
  if (rejectMethod(req, res, ["DELETE"])) return;

  const { id } = req.query;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  try {
    await connectDb();

    const product = await Product.findById(id).lean();
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await Review.deleteMany({ productId: id });
    await Product.findByIdAndDelete(id);

    // Clean up the product's images (best effort)
    await deleteImages((product.productVariants || []).flatMap((variant) => variant.images || []));

    return res.status(200).json({
      message: "Product and its reviews were deleted",
      deletedProductId: id,
    });
  } catch (error) {
    return sendError(res, error, "Failed to delete product");
  }
}
