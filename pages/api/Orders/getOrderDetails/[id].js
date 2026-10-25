import connectDb from "lib/database/db";
import Checkout from "lib/Models/checkoutModel";
import { isValidObjectId, rejectMethod, sendError } from "lib/http";

export default async function handler(req, res) {
  if (rejectMethod(req, res, ["GET"])) return;

  const { id } = req.query;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid order ID" });
  }

  try {
    await connectDb();
    const order = await Checkout.findById(id).lean();
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    return res.status(200).json({ order, message: "Order fetched successfully" });
  } catch (error) {
    return sendError(res, error, "Failed to load order");
  }
}
