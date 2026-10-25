import connectDb from "lib/database/db";
import Contact from "lib/Models/contactModel";
import { isValidObjectId, rejectMethod, sendError } from "lib/http";

// PUT /api/contact/changeStatus/:id            -> mark as read
// PUT /api/contact/changeStatus/:id?read=false -> mark as unread
export default async function handler(req, res) {
  if (rejectMethod(req, res, ["PUT"])) return;

  const { id, read } = req.query;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid enquiry ID" });
  }
  const isOpened = read !== "false";

  try {
    await connectDb();
    const contactDetails = await Contact.findByIdAndUpdate(id, { $set: { isOpened } }, { new: true }).lean();
    if (!contactDetails) {
      return res.status(404).json({ message: "Enquiry not found" });
    }
    return res.status(200).json({
      contactDetails,
      message: isOpened ? "Marked as read" : "Marked as unread",
    });
  } catch (error) {
    return sendError(res, error, "Failed to update enquiry");
  }
}
