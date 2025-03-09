import connectDb from "lib/database/db";
import mongoose from "mongoose";

export default async function handler(req, res){
    if( req.method !== "GET"){
        return res.status(405).json({ message: "Method not allowed" });
    }

    const Contact = mongoose.models.Contact || new mongoose.model("Contact", new mongoose.Schema({}));

    try {
        await connectDb()
        const response = await Contact.find({}).sort({ createdAt: -1 })
        if(response.length === 0){
            return res.status(404).json({ message : "No emails found"})
        }
        const unreadLength = await Contact.find({ isOpened : false })
        console.log("Total Contacts:", response.length);
        console.log("Unread Contacts:", unreadLength);

        return res.status(200).json({ contactDetails : response, unreadLength : unreadLength.length, message: "Contact fetched successfully" })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}