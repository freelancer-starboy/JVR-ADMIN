import connectDb from "lib/database/db";
import Product from "lib/Models/AddProduct";
import { rejectMethod, sendError } from "lib/http";

export default async function handler(req, res) {
  if (rejectMethod(req, res, ["GET"])) return;

  try {
    await connectDb();
    const products = await Product.find({}).sort({ _id: -1 }).lean();
    return res.status(200).json({ products, message: "Products fetched successfully" });
  } catch (error) {
    return sendError(res, error, "Failed to load products");
  }
}
