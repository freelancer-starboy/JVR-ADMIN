import { HttpError } from "lib/http";

// Turns the multipart fields sent by the product form into data matching
// lib/Models/AddProduct.js (the schema shared with the storefront).

const first = (value) => (Array.isArray(value) ? value[0] : value);
const text = (value) => (first(value) ?? "").toString().trim();

const capitalize = (value) => (value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : value);

function parseJson(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    throw new HttpError(400, "Invalid form data");
  }
}

export function readProductFields(fields) {
  const productName = text(fields.productName);
  const productBrand = text(fields.productBrand);
  // Storefront convention: categories are lowercase (mens, women, kids),
  // types are capitalised (Shirts, Saree, Set ...)
  const productCategory = text(fields.productCategory).toLowerCase();
  const productType = capitalize(text(fields.productType));
  const productPrice = Number(text(fields.productPrice));
  const oldPriceRaw = text(fields.productOldPrice);
  const productOldPrice = oldPriceRaw === "" ? 0 : Number(oldPriceRaw);

  let productDetails = parseJson(text(fields.productDetails), [""]);
  if (!Array.isArray(productDetails)) productDetails = [productDetails];
  productDetails = productDetails.map((detail) => String(detail ?? ""));
  if (productDetails.length === 0) productDetails = [""];

  if (!productName) throw new HttpError(400, "Product name is required");
  if (!productBrand) throw new HttpError(400, "Brand is required");
  if (!productCategory) throw new HttpError(400, "Category is required");
  if (!productType) throw new HttpError(400, "Product type is required");
  if (!Number.isFinite(productPrice) || productPrice <= 0) throw new HttpError(400, "Enter a valid selling price");
  if (!Number.isFinite(productOldPrice) || productOldPrice < 0) throw new HttpError(400, "Enter a valid MRP");

  return {
    productName,
    productBrand,
    productCategory,
    productType,
    productPrice,
    productOldPrice,
    productDetails,
  };
}

// Returns [{ color, sizes: [{ size, stock }], existingImages: [url] }]
export function readVariants(fields) {
  const raw = parseJson(text(fields.productVariants), null);
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new HttpError(400, "Add at least one colour variant");
  }

  return raw.map((variant, index) => {
    const label = `Variant ${index + 1}`;
    const color = String(variant?.color ?? "").trim();
    if (!color) throw new HttpError(400, `${label}: colour is required`);

    const sizes = (Array.isArray(variant.sizes) ? variant.sizes : [])
      .map((size) => ({
        size: String(size?.size ?? "").trim(),
        stock: Math.max(0, Math.floor(Number(size?.stock) || 0)),
      }))
      .filter((size) => size.size);
    if (sizes.length === 0) throw new HttpError(400, `${label}: add at least one size`);

    const seen = new Set();
    for (const { size } of sizes) {
      const key = size.toLowerCase();
      if (seen.has(key)) throw new HttpError(400, `${label}: size "${size}" is listed twice`);
      seen.add(key);
    }

    const existingImages = (Array.isArray(variant.existingImages) ? variant.existingImages : []).filter(
      (url) => typeof url === "string" && /^https?:\/\//.test(url)
    );

    return { color, sizes, existingImages };
  });
}

export function variantFiles(files, index) {
  const value = files[`variantImages_${index}`];
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}
