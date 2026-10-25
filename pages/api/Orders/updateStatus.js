import connectDb from "lib/database/db";
import Checkout from "lib/Models/checkoutModel";
import { ORDER_STATUSES } from "lib/orders";
import { isValidObjectId, rejectMethod, sendError } from "lib/http";

// PUT /api/Orders/updateStatus?id=<orderId>&status=<Processing|Packed|Dispatched|Delivered>
export default async function handler(req, res) {
  if (rejectMethod(req, res, ["PUT"])) return;

  const id = req.query.id || req.body?.id;
  const status = req.query.status || req.body?.status;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid order ID" });
  }
  if (!ORDER_STATUSES.includes(status)) {
    return res.status(400).json({ message: `Status must be one of: ${ORDER_STATUSES.join(", ")}` });
  }

  try {
    await connectDb();

    const order = await Checkout.findByIdAndUpdate(
      id,
      { $set: { orderStatus: status, updatedAt: new Date() } },
      { new: true }
    ).lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({ order, message: `Order marked as ${status}` });
  } catch (error) {
    return sendError(res, error, "Failed to update order status");
  }
}
