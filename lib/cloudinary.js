import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const PRODUCT_FOLDER = "products";

export function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
  );
}

// Uploads local files (formidable File objects) and resolves to their secure URLs, in order.
export async function uploadImages(files) {
  return Promise.all(
    files.map((file) =>
      cloudinary.uploader
        .upload(file.filepath, { folder: PRODUCT_FOLDER, resource_type: "image" })
        .then((result) => result.secure_url)
    )
  );
}

// https://res.cloudinary.com/<cloud>/image/upload/v123/products/abc.jpg -> products/abc
export function publicIdFromUrl(url) {
  if (typeof url !== "string" || !url.includes("res.cloudinary.com/")) return null;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (cloudName && !url.includes(`res.cloudinary.com/${cloudName}/`)) return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?([^?]+?)(?:\.[a-z0-9]+)?(?:\?.*)?$/i);
  return match ? decodeURIComponent(match[1]) : null;
}

// Best-effort removal of uploaded images; never throws.
export async function deleteImages(urls = []) {
  if (!isCloudinaryConfigured()) return;
  const ids = [...new Set(urls.map(publicIdFromUrl).filter(Boolean))];
  await Promise.all(
    ids.map((id) =>
      cloudinary.uploader.destroy(id).catch((error) => {
        console.error(`Failed to delete Cloudinary image ${id}:`, error?.message || error);
      })
    )
  );
}
