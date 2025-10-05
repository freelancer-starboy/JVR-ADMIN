import connectDb from 'lib/database/db';
import Product from 'lib/Models/AddProduct';
import Review from 'lib/Models/reviewModel';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDb();

    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // has reviews
    const reviews = await Review.find({
        productId
    })



    return res.status(200).json({
      message: "Product fetched successfully",
      product,
      reviews
    });

  } catch (error) {
    console.error("Error fetching product:", error);
    return res.status(500).json({ message: error.message });
  }
}
