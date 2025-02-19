import connectDb from "lib/database/db";
import mongoose from "mongoose";

export default async function handler(req, res){
    if(req.method !== "PUT"){
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { id, status } = req.query;

    if(!id || !status){
        return res.status(400).json({ message: "Missing required parameters" });
    }

    try {
        // 1. First verify connection
        await connectDb();
        console.log("Database connected successfully");

        // 2. Verify the ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }

        // 3. First try to find the document
        const Orders = mongoose.models.Checkout || mongoose.model("Checkout", new mongoose.Schema({}));
        const existingOrder = await Orders.findById(id);
        console.log("Existing order:", existingOrder);

        if (!existingOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        // 4. Try the update with explicit ObjectId
        const updateResult = await Orders.updateOne(
            { _id: id },
            { 
                $set: { 
                    orderStatus: status,
                    updatedAt: new Date() 
                } 
            },
            { strict: false } // This will allow updates even if fields aren't in schema
        );

        console.log("Update result:", updateResult);

        if (updateResult.acknowledged) {
            const updatedOrder = await Orders.findById(id);
            return res.status(201).json({ 
                order: updatedOrder, 
                message: "Order status updated successfully" 
            });
        } else {
            return res.status(400).json({ 
                message: "Update not acknowledged by database",
                details: updateResult
            });
        }

    } catch(error){
        console.error("Error in update operation:", error);
        return res.status(500).json({ 
            message: "Update failed", 
            error: error.message,
            stack: error.stack
        });
    }
}