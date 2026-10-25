import mongoose from "mongoose";

// Mirrors the storefront schema (JVR lib/Schema/whatsappEnquirySchema.js).
// One document per customer (or anonymous visitor); every "Order on WhatsApp"
// click is pushed into `enquiries`. Keep both copies in sync.

const itemSchema = new mongoose.Schema(
  {
    productId: String,
    productName: String,
    productImage: String,
    price: Number,
    color: String,
    size: String,
    quantity: { type: Number, default: 1 },
  },
  { _id: false }
);

const enquirySchema = new mongoose.Schema({
  source: { type: String, enum: ["cart", "product", "wishlist"], required: true },
  items: [itemSchema],
  totalAmount: Number,
  pageUrl: String,
  createdAt: { type: Date, default: Date.now },
});

const whatsappEnquirySchema = new mongoose.Schema(
  {
    userKey: { type: String, required: true, unique: true }, // firebase uid, or "guest:<visitorId>"
    userId: { type: String, default: null }, // firebase uid when logged in
    isGuest: { type: Boolean, default: false },
    name: String,
    email: String,
    phone: String,
    enquiries: [enquirySchema], // one entry per WhatsApp click, newest pushed last
    totalEnquiries: { type: Number, default: 0 },
    lastEnquiryAt: Date,
    followUpStatus: {
      type: String,
      enum: ["new", "contacted", "converted", "not_interested"],
      default: "new",
    },
    followUpNotes: { type: String, default: "" },
  },
  { timestamps: true }
);

export const FOLLOW_UP_STATUSES = ["new", "contacted", "converted", "not_interested"];

const WhatsappEnquiry =
  mongoose.models.WhatsappEnquiry ||
  mongoose.model("WhatsappEnquiry", whatsappEnquirySchema, "whatsapp_enquiries");

export default WhatsappEnquiry;
