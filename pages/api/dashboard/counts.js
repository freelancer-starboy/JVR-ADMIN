import connectDb from "lib/database/db";
import Contact from "lib/Models/contactModel";
import WhatsappEnquiry from "lib/Models/whatsappEnquiryModel";
import { rejectMethod, sendError } from "lib/http";

// Lightweight badge counts for the sidebar / top bar.
export default async function handler(req, res) {
  if (rejectMethod(req, res, ["GET"])) return;

  try {
    await connectDb();
    const [newLeads, unreadEnquiries] = await Promise.all([
      WhatsappEnquiry.countDocuments({ followUpStatus: { $in: ["new", null] } }),
      Contact.countDocuments({ isOpened: { $ne: true } }),
    ]);
    return res.status(200).json({ newLeads, unreadEnquiries });
  } catch (error) {
    return sendError(res, error, "Failed to load counts");
  }
}
