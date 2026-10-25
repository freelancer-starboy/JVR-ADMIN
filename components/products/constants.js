// Values the storefront filters on. Categories are stored lowercase; the API
// capitalises product types (e.g. "tshirts" -> "Tshirts").
export const CATEGORIES = [
  { value: "women", label: "Women" },
  { value: "mens", label: "Mens" },
  { value: "kids", label: "Kids" },
];

export const TYPES_BY_CATEGORY = {
  mens: ["Shirts", "Pants", "Tshirts"],
  women: ["Kurta", "Saree", "Leggins", "Shirts", "Pants"],
  kids: ["Set"],
};

export const ADULT_SIZES = ["S", "M", "L", "XL", "XXL", "XXXL", "28", "30", "32", "34", "36", "38", "40", "Free Size"];
export const KIDS_SIZES = ["0 To 1 year", "1 To 2 year", "2 To 3 year", "3 To 4 year", "4 To 5 year"];

export const QUICK_COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Maroon", hex: "#800000" },
  { name: "Red", hex: "#D32F2F" },
  { name: "Pink", hex: "#EC4899" },
  { name: "Orange", hex: "#F97316" },
  { name: "Mustard", hex: "#D4A017" },
  { name: "Green", hex: "#15803D" },
  { name: "Bottle green", hex: "#064E3B" },
  { name: "Sky blue", hex: "#38BDF8" },
  { name: "Navy", hex: "#1E3A8A" },
  { name: "Purple", hex: "#7E22CE" },
  { name: "Beige", hex: "#E8D9B5" },
  { name: "Grey", hex: "#9CA3AF" },
];

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export function categoryLabel(value) {
  return CATEGORIES.find((category) => category.value === String(value || "").toLowerCase())?.label || value || "—";
}

export function sizeOptions(category) {
  return String(category || "").toLowerCase() === "kids" ? KIDS_SIZES : ADULT_SIZES;
}
