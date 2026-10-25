import connectDb from "lib/database/db";
import Product from "lib/Models/AddProduct";
import Checkout from "lib/Models/checkoutModel";
import Contact from "lib/Models/contactModel";
import WhatsappEnquiry from "lib/Models/whatsappEnquiryModel";
import { countByKey, rejectMethod, sendError } from "lib/http";

const TIMEZONE = "Asia/Kolkata";
const CHART_DAYS = 14;
const LOW_STOCK_THRESHOLD = 5;
const PAID_STATUSES = ["captured", "Captured", "paid", "Paid", "success", "Success", "completed", "Completed"];

function dayKey(date) {
  // YYYY-MM-DD in India time
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE }).format(date);
}

async function productStats() {
  const rows = await Product.aggregate([
    {
      $project: {
        productName: 1,
        productCategory: 1,
        productType: 1,
        image: { $arrayElemAt: [{ $arrayElemAt: ["$productVariants.images", 0] }, 0] },
        stock: {
          $sum: {
            $map: { input: { $ifNull: ["$productVariants", []] }, as: "v", in: { $sum: "$$v.sizes.stock" } },
          },
        },
      },
    },
  ]);

  return {
    total: rows.length,
    totalStock: rows.reduce((sum, row) => sum + (row.stock || 0), 0),
    outOfStock: rows.filter((row) => !row.stock).length,
    lowStock: rows
      .filter((row) => (row.stock || 0) <= LOW_STOCK_THRESHOLD)
      .sort((a, b) => (a.stock || 0) - (b.stock || 0))
      .slice(0, 6),
  };
}

async function orderStats() {
  const [byStatus, revenue] = await Promise.all([
    Checkout.aggregate([{ $group: { _id: "$orderStatus", count: { $sum: 1 } } }]),
    Checkout.aggregate([
      { $match: { "paymentDetails.status": { $in: PAID_STATUSES } } },
      { $group: { _id: null, total: { $sum: "$orderTotal" } } },
    ]),
  ]);
  const statusCounts = countByKey(byStatus);
  const total = byStatus.reduce((sum, row) => sum + row.count, 0);
  return {
    total,
    open: total - (statusCounts.Delivered || 0),
    statusCounts,
    revenue: revenue[0]?.total || 0,
  };
}

async function leadStats() {
  const since = new Date(Date.now() - CHART_DAYS * 24 * 60 * 60 * 1000);

  const [byStatus, daily, recent] = await Promise.all([
    WhatsappEnquiry.aggregate([{ $group: { _id: "$followUpStatus", count: { $sum: 1 } } }]),
    WhatsappEnquiry.aggregate([
      { $unwind: "$enquiries" },
      { $match: { "enquiries.createdAt": { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$enquiries.createdAt", timezone: TIMEZONE } },
          count: { $sum: 1 },
        },
      },
    ]),
    WhatsappEnquiry.find({})
      .select({ enquiries: { $slice: -1 } })
      .sort({ lastEnquiryAt: -1, updatedAt: -1 })
      .limit(6)
      .lean(),
  ]);

  const dailyMap = Object.fromEntries(daily.map((row) => [row._id, row.count]));
  const chart = [];
  for (let i = CHART_DAYS - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = dayKey(date);
    chart.push({ date: key, count: dailyMap[key] || 0 });
  }

  const statusCounts = countByKey(byStatus, "new");

  return {
    total: byStatus.reduce((sum, row) => sum + row.count, 0),
    statusCounts,
    newCount: statusCounts.new || 0,
    enquiriesLast7Days: chart.slice(-7).reduce((sum, day) => sum + day.count, 0),
    enquiriesInChart: chart.reduce((sum, day) => sum + day.count, 0),
    chart,
    recent: recent.map(({ enquiries, ...lead }) => ({ ...lead, lastEnquiry: enquiries?.[0] || null })),
  };
}

async function contactStats() {
  const [total, unread] = await Promise.all([
    Contact.countDocuments({}),
    Contact.countDocuments({ isOpened: { $ne: true } }),
  ]);
  return { total, unread };
}

export default async function handler(req, res) {
  if (rejectMethod(req, res, ["GET"])) return;

  try {
    await connectDb();
    const [products, orders, leads, enquiries] = await Promise.all([
      productStats(),
      orderStats(),
      leadStats(),
      contactStats(),
    ]);
    return res.status(200).json({ products, orders, leads, enquiries });
  } catch (error) {
    return sendError(res, error, "Failed to load dashboard");
  }
}
