import connectDb from "lib/database/db";
import WhatsappEnquiry, { FOLLOW_UP_STATUSES } from "lib/Models/whatsappEnquiryModel";
import { isValidObjectId, rejectMethod, sendError } from "lib/http";

const MAX_NOTES_LENGTH = 5000;

function serialize(lead) {
  const enquiries = [...(lead.enquiries || [])].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );
  return { ...lead, enquiries };
}

// GET   /api/leads/:id  -> the lead with every enquiry (newest first)
// PATCH /api/leads/:id  { followUpStatus?, followUpNotes? }
export default async function handler(req, res) {
  if (rejectMethod(req, res, ["GET", "PATCH"])) return;

  const { id } = req.query;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid lead ID" });
  }

  try {
    await connectDb();

    if (req.method === "GET") {
      const lead = await WhatsappEnquiry.findById(id).lean();
      if (!lead) return res.status(404).json({ message: "Lead not found" });
      return res.status(200).json({ lead: serialize(lead) });
    }

    const { followUpStatus, followUpNotes } = req.body || {};
    const update = {};

    if (followUpStatus !== undefined) {
      if (!FOLLOW_UP_STATUSES.includes(followUpStatus)) {
        return res.status(400).json({ message: "Invalid follow-up status" });
      }
      update.followUpStatus = followUpStatus;
    }

    if (followUpNotes !== undefined) {
      if (typeof followUpNotes !== "string" || followUpNotes.length > MAX_NOTES_LENGTH) {
        return res.status(400).json({ message: `Notes must be text up to ${MAX_NOTES_LENGTH} characters` });
      }
      update.followUpNotes = followUpNotes;
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const lead = await WhatsappEnquiry.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true }).lean();
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    return res.status(200).json({ lead: serialize(lead), message: "Lead updated" });
  } catch (error) {
    return sendError(res, error, "Failed to update lead");
  }
}
