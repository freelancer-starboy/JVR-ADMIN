const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("en-IN");

export function formatCurrency(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return currencyFormatter.format(n);
}

export function formatNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? numberFormatter.format(n) : "0";
}

export function formatDate(value, { withTime = false } = {}) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit", hour12: true } : {}),
  });
}

export function formatRelative(value) {
  if (!value) return "—";
  const date = new Date(value);
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (Number.isNaN(seconds)) return "—";
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return formatDate(date);
}

export function initials(name) {
  if (!name) return "?";
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] || "?").toUpperCase() + (parts[1]?.[0] || "").toUpperCase();
}

export function shortId(id) {
  return id ? String(id).slice(-6).toUpperCase() : "";
}

export function productStock(product) {
  return (product?.productVariants || []).reduce(
    (sum, variant) => sum + (variant.sizes || []).reduce((acc, size) => acc + (Number(size.stock) || 0), 0),
    0
  );
}

export function capitalize(value) {
  if (!value) return "";
  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
}

// Builds a wa.me link from an Indian (or international) phone number.
export function whatsappLink(phone) {
  if (!phone) return null;
  let digits = String(phone).replace(/[^0-9]/g, "");
  if (digits.length === 10) digits = `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) digits = `91${digits.slice(1)}`;
  return digits.length >= 11 ? `https://wa.me/${digits}` : null;
}
