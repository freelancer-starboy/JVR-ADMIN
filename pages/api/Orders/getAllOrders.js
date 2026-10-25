import connectDb from "lib/database/db";
import Checkout from "lib/Models/checkoutModel";
import { ORDER_STATUSES } from "lib/orders";
import { countByKey, escapeRegex, isValidObjectId, rejectMethod, sendError, toPositiveInt } from "lib/http";

export default async function handler(req, res) {
  if (rejectMethod(req, res, ["GET"])) return;

  const page = toPositiveInt(req.query.page, 1);
  const limit = toPositiveInt(req.query.limit, 10, 100);
  const status = typeof req.query.status === "string" ? req.query.status : req.query.search;
  const searchQuery = typeof req.query.searchQuery === "string" ? req.query.searchQuery.trim() : "";

  const filter = {};
  if (ORDER_STATUSES.includes(status)) {
    filter.orderStatus = status;
  }

  if (searchQuery) {
    const orderId = searchQuery.replace(/^#?-?JVR-/i, "").trim();
    if (isValidObjectId(orderId)) {
      filter._id = orderId;
    } else {
      const regex = { $regex: escapeRegex(searchQuery), $options: "i" };
      filter.$or = [
        { "cartItems.productName": regex },
        { "shippingAddress.fullName": regex },
        { "shippingAddress.phone": regex },
        { "paymentDetails.transactionId": regex },
      ];
    }
  }

  try {
    await connectDb();

    const [orders, totalOrders, statusCounts] = await Promise.all([
      Checkout.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Checkout.countDocuments(filter),
      Checkout.aggregate([{ $group: { _id: "$orderStatus", count: { $sum: 1 } } }]),
    ]);

    return res.status(200).json({
      orders,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: page,
      statusCounts: countByKey(statusCounts),
      message: "Orders fetched successfully",
    });
  } catch (error) {
    return sendError(res, error, "Failed to load orders");
  }
}
