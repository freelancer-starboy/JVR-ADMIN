import connectDb from "lib/database/db";
import mongoose from "mongoose";

export default async function handler(req, res){
    if(req.method !== "GET"){
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { id } = req.query;
    const Contact = mongoose.models.Contact || new mongoose.model("Contact", new mongoose.Schema({}));
    try {
        await connectDb()
        const response = await Contact.findById(id)
        if(!response){
            return res.status(404).json({ message : "Contact Not Found"})
        }
        return res.status(200).json({ contactDetails : response, message: "Contact fetched successfully" })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}