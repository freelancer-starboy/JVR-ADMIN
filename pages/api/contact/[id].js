import connectDb from "lib/database/db";
import Contact from "lib/Models/contactModel";
import { isValidObjectId, rejectMethod, sendError } from "lib/http";

// GET    /api/contact/:id  -> one enquiry (contact-form message)
// DELETE /api/contact/:id  -> remove it
export default async function handler(req, res) {
  if (rejectMethod(req, res, ["GET", "DELETE"])) return;

  const { id } = req.query;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid enquiry ID" });
  }

  try {
    await connectDb();

    if (req.method === "DELETE") {
      const deleted = await Contact.findByIdAndDelete(id).lean();
      if (!deleted) return res.status(404).json({ message: "Enquiry not found" });
      return res.status(200).json({ message: "Enquiry deleted" });
    }

    const contactDetails = await Contact.findById(id).lean();
    if (!contactDetails) {
      return res.status(404).json({ message: "Enquiry not found" });
    }
    return res.status(200).json({ contactDetails, message: "Enquiry fetched successfully" });
  } catch (error) {
    return sendError(res, error, "Failed to load enquiry");
  }
}
