import nodemailer from "nodemailer";
import connectDb from "lib/database/db";
import Contact from "lib/Models/contactModel";
import { isValidObjectId, rejectMethod, sendError } from "lib/http";

const DEFAULT_SENDER = "sreejvrtextiles@gmail.com";

// POST /api/contact/replyEmail  { id, message }  (message is HTML from the editor)
export default async function handler(req, res) {
  if (rejectMethod(req, res, ["POST"])) return;

  const { id, message } = req.body || {};
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid enquiry ID" });
  }
  const text = typeof message === "string" ? message.replace(/<[^>]*>/g, "").trim() : "";
  if (!text) {
    return res.status(400).json({ message: "Write a reply before sending" });
  }

  const sender = process.env.NODEMAILER_USER || DEFAULT_SENDER;
  if (!process.env.NODEMAILER_APP_PASSWORD) {
    return res.status(500).json({ message: "Email is not configured (NODEMAILER_APP_PASSWORD missing)" });
  }

  try {
    await connectDb();
    const contact = await Contact.findById(id).lean();
    if (!contact) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: sender, pass: process.env.NODEMAILER_APP_PASSWORD },
    });

    const info = await transporter.sendMail({
      from: `"SRI JVR TEXTILES" <${sender}>`,
      to: contact.email,
      subject: contact.subject ? `Re: ${contact.subject}` : "SRI JVR TEXTILES",
      html: message,
    });

    if (!info.accepted?.length) {
      return res.status(502).json({ message: "The email could not be delivered" });
    }

    await Contact.updateOne(
      { _id: id },
      {
        $push: { replies: { email: contact.email, message, createdAt: new Date() } },
        $set: { isOpened: true },
      }
    );

    return res.status(200).json({ message: "Reply sent", statusCode: 200 });
  } catch (error) {
    return sendError(res, error, "Failed to send reply");
  }
}
