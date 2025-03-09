import connectDb from "lib/database/db";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
export default async function handler(req, res){
    if( req.method !== 'POST'){
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { message, email, id } = req.body
    if(!message || !email || !id){
        return res.status(400).json({ message: "Missing required parameters" });
    }

    const Contact = mongoose.models.Contact || new mongoose.model("Contact", new mongoose.Schema({}));
    try {
        const transporter = nodemailer.createTransport({
            service : 'gmail',
            auth : {
                user : "sreejvrtextiles@gmail.com",
                pass : process.env.NODEMAILER_APP_PASSWORD
            }
        })

        const mailSend = await transporter.sendMail({
            from : `"JVR Textiles" <sreejvrtextiles.com>`,
            to : email,
            subject : "JVR Textiles",
            html : message
        })

        const success = mailSend.accepted[0]

        await connectDb()
        if(success){
            const response = await Contact.findByIdAndUpdate(
                id,
                {
                    $push : {
                        replies : {
                            email : email,
                            message : message,
                            createdAt : Date.now()
                        }
                    }
                },
                {
                    strict : false
                }
            )
            if(!response){
                return res.status(404).json({ message : "Contact Not Found"})
            }
    
            return res.status(200).json({ message: "Reply added successfully", statusCode : 200 })
        }else{
            return res.status(500).json({ message: "Email not send"})
        }
       
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}