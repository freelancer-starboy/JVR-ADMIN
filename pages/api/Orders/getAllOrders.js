import connectDb from "lib/database/db";
import mongoose from "mongoose";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        await connectDb();
        const { page = 1, limit = 10, search, searchQuery } = req.query;
        console.log("search query from backend: ", searchQuery);
        
        // Ensure model is correctly referenced
        const Orders = mongoose.models.Checkout || mongoose.model("Checkout", new mongoose.Schema({}));

        const filter = {};
        const validStatus = ["Processing", "Packed", "Dispatched", "Delivered"];
        
        if (validStatus.includes(search)) {
            filter.orderStatus = search;
        }
        
        if (searchQuery) {
            if (searchQuery.startsWith("#-JVR-")) {
                const orderId = searchQuery.replace("#-JVR-", "").trim();
                
                if (mongoose.Types.ObjectId.isValid(orderId)) {
                    filter._id = new mongoose.Types.ObjectId(orderId);
                }
            } else {
                filter.$or = [
                    { cartItems: { $elemMatch: { productName: { $regex: searchQuery, $options: "i" } } } }
                ];
            }
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const allOrders = await Orders.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
            
        const totalOrders = await Orders.countDocuments(filter);
        const totalPages = Math.ceil(totalOrders / parseInt(limit));
        
        if (!allOrders || allOrders.length === 0) {
            return res.status(404).json({ message: "Orders not found" });
        }

        return res.status(200).json({ 
            orders: allOrders, 
            totalPages, 
            currentPage: parseInt(page),
            totalOrders,
            message: "Orders fetched successfully" 
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        return res.status(500).json({ message: error.message });
    }
}