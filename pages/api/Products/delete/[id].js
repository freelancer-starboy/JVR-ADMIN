import connectDb from 'lib/database/db';
import Product from 'lib/Models/AddProduct';
import Review from 'lib/Models/reviewModel';

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDb();

    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete associated reviews first
    await Review.deleteMany({ productId: id });

    // Delete the product
    await Product.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Product and associated reviews deleted successfully",
      deletedProductId: id
    });

  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({ message: error.message });
  }
}