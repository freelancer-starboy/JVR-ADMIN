import connectDb from "lib/database/db";
import Contact from "lib/Models/contactModel";
import { escapeRegex, rejectMethod, sendError } from "lib/http";

// GET /api/contact/getContact?filter=all|unread&q=<search>
export default async function handler(req, res) {
  if (rejectMethod(req, res, ["GET"])) return;

  const filter = {};
  if (req.query.filter === "unread") filter.isOpened = { $ne: true };

  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  if (q) {
    const regex = { $regex: escapeRegex(q), $options: "i" };
    filter.$or = [{ name: regex }, { email: regex }, { subject: regex }, { message: regex }];
  }

  try {
    await connectDb();
    const [contactDetails, unreadLength, total] = await Promise.all([
      Contact.find(filter).sort({ createdAt: -1 }).limit(500).lean(),
      Contact.countDocuments({ isOpened: { $ne: true } }),
      Contact.countDocuments({}),
    ]);

    return res.status(200).json({
      contactDetails,
      unreadLength,
      total,
      message: "Enquiries fetched successfully",
    });
  } catch (error) {
    return sendError(res, error, "Failed to load enquiries");
  }
}
