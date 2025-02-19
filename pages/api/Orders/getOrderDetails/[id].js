import connectDb from "lib/database/db";
import mongoose from "mongoose";

export default async function handler(req, res){
    if( req.method !== "GET"){
        return res.status(405).json({ message: "Method not allowed" });
    }
    const { id } = req.query
    
    const Orders = mongoose.models.Checkout || new mongoose.model("Checkout", new mongoose.Schema({}));
    

    await connectDb()

    try {
        const response = await Orders.findById(id)
        if(!response){
            return res.status(404).json({ message : "Orders Not Found"})
        }
        return res.status(200).json({ order: response, message: "Order fetched successfully" })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}