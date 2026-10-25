import connectDb from "lib/database/db";
import WhatsappEnquiry, { FOLLOW_UP_STATUSES } from "lib/Models/whatsappEnquiryModel";
import { countByKey, escapeRegex, rejectMethod, sendError, toPositiveInt } from "lib/http";

// GET /api/leads?q=&status=&page=&limit=
// WhatsApp leads (one per customer/visitor), most recent enquiry first.
export default async function handler(req, res) {
  if (rejectMethod(req, res, ["GET"])) return;

  const page = toPositiveInt(req.query.page, 1);
  const limit = toPositiveInt(req.query.limit, 20, 100);
  const status = typeof req.query.status === "string" ? req.query.status : "";
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

  const filter = {};
  if (FOLLOW_UP_STATUSES.includes(status)) {
    // documents without a status are treated as "new"
    filter.followUpStatus = status === "new" ? { $in: ["new", null] } : status;
  }
  if (q) {
    const regex = { $regex: escapeRegex(q), $options: "i" };
    filter.$or = [
      { name: regex },
      { email: regex },
      { phone: regex },
      { "enquiries.items.productName": regex },
    ];
  }

  try {
    await connectDb();

    const [leads, total, statusCounts] = await Promise.all([
      WhatsappEnquiry.find(filter)
        .select({ enquiries: { $slice: -1 } }) // only the latest enquiry, for the preview
        .sort({ lastEnquiryAt: -1, updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      WhatsappEnquiry.countDocuments(filter),
      WhatsappEnquiry.aggregate([{ $group: { _id: "$followUpStatus", count: { $sum: 1 } } }]),
    ]);

    return res.status(200).json({
      leads: leads.map(({ enquiries, ...lead }) => ({
        ...lead,
        lastEnquiry: enquiries?.[0] || null,
      })),
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      statusCounts: countByKey(statusCounts, "new"),
    });
  } catch (error) {
    return sendError(res, error, "Failed to load WhatsApp leads");
  }
}
