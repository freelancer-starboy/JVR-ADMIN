import connectDb from "lib/database/db";
import mongoose from "mongoose";

export default async function handler(req, res){
    if( req.method !== "GET"){
        return res.status(405).json({ message: "Method not allowed" });
    }
    const Product = mongoose.models.Product || new mongoose.model("Product", new mongoose.Schema({}));

    try {
        await connectDb()

        const response = await Product.find({})
        if(response.length === 0){
            return res.status(404).json({ message : "Products Not Found"})
        }
        return res.status(200).json({ products: response, message: "Products fetched successfully" })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}