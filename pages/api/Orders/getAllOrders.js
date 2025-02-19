import connectDb from "lib/database/db";
import mongoose from "mongoose";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    await connectDb();
    const { page, limit, search, searchQuery } = req.query;
    console.log("search query from backend : ", searchQuery)
    // Ensure model is correctly referenced
    const Orders = mongoose.models.Checkout || new mongoose.model("Checkout", new mongoose.Schema({}));

    try {
        const filter = {}
        const validStatus = ["Processing", "Packed", "Dispatched", "Delivered"];
        if(validStatus.includes(search)) filter.orderStatus = search
        if (searchQuery) {
            // Split search into separate queries for different fields
            filter.$or = [
                { "cartItems.productName": { $regex: searchQuery, $options: "i"} }
            ];

            // Only add _id search if searchQuery could be a valid ObjectId
        }
        const skip = (page - 1)* limit
        const allOrders = await Orders.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
        const totalOrders = await Orders.countDocuments(filter);
        const totalPages = Math.ceil(totalOrders / limit);
        if (!allOrders || allOrders.length === 0) {
            return res.status(404).json({ message: "Orders not found" });
        }

        return res.status(200).json({ orders: allOrders, totalPages, message: "Orders fetched successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
