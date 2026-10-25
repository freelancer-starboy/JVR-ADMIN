import mongoose from "mongoose";

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Responds with 405 unless req.method is one of `methods`. Returns true when rejected.
export function rejectMethod(req, res, methods) {
  if (methods.includes(req.method)) return false;
  res.setHeader("Allow", methods.join(", "));
  res.status(405).json({ message: "Method not allowed" });
  return true;
}

export function isValidObjectId(id) {
  return typeof id === "string" && /^[a-f0-9]{24}$/i.test(id) && mongoose.Types.ObjectId.isValid(id);
}

export function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function toPositiveInt(value, fallback, max = Infinity) {
  const n = parseInt(value, 10);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(n, max);
}

// [{ _id: "new", count: 2 }, { _id: null, count: 1 }] -> { new: 3 }  (missing keys use `fallbackKey`)
export function countByKey(rows, fallbackKey = "Unknown") {
  return rows.reduce((acc, row) => {
    const key = row._id || fallbackKey;
    acc[key] = (acc[key] || 0) + row.count;
    return acc;
  }, {});
}

// Sends a JSON error. Unexpected errors are logged and hidden behind a generic message.
export function sendError(res, error, fallbackMessage = "Something went wrong") {
  const status = error?.status || (error?.name === "ValidationError" ? 400 : 500);
  if (status >= 500) {
    console.error(`${fallbackMessage}:`, error);
    return res.status(status).json({ message: fallbackMessage });
  }
  return res.status(status).json({ message: error.message });
}
