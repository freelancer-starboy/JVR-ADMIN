import Product from "lib/Models/AddProduct";
import connectDb from "lib/database/db";
import { HttpError, isValidObjectId, rejectMethod, sendError } from "lib/http";
import parseForm from "lib/products/parseForm";
import { readProductFields, readVariants, variantFiles } from "lib/products/formPayload";
import { deleteImages, isCloudinaryConfigured, uploadImages } from "lib/cloudinary";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (rejectMethod(req, res, ["PUT", "PATCH"])) return;

  const uploaded = [];

  try {
    const { fields, files } = await parseForm(req);

    const rawId = Array.isArray(fields.productId) ? fields.productId[0] : fields.productId;
    const productId = String(rawId || "").trim();
    if (!isValidObjectId(productId)) throw new HttpError(400, "Invalid product ID");

    const basicFields = readProductFields(fields);
    const variants = readVariants(fields);

    await connectDb();
    const product = await Product.findById(productId);
    if (!product) throw new HttpError(404, "Product not found");

    // Only images that already belong to this product can be kept
    const currentImages = new Set(product.productVariants.flatMap((variant) => variant.images || []));

    const hasNewFiles = variants.some((_, index) => variantFiles(files, index).length > 0);
    if (hasNewFiles && !isCloudinaryConfigured()) {
      throw new HttpError(500, "Image uploads are not configured (CLOUDINARY_* env vars missing)");
    }

    variants.forEach((variant, index) => {
      const kept = variant.existingImages.filter((url) => currentImages.has(url));
      if (kept.length + variantFiles(files, index).length === 0) {
        throw new HttpError(400, `Variant ${index + 1} (${variant.color}): add at least one image`);
      }
    });

    const productVariants = [];
    for (let index = 0; index < variants.length; index++) {
      const { color, sizes, existingImages } = variants[index];
      const kept = existingImages.filter((url) => currentImages.has(url));
      const newImages = await uploadImages(variantFiles(files, index));
      uploaded.push(...newImages);
      productVariants.push({ color, sizes, images: [...kept, ...newImages] });
    }

    product.set({ ...basicFields, productVariants });
    await product.save();

    // Remove images that are no longer used by any variant (best effort)
    const stillUsed = new Set(productVariants.flatMap((variant) => variant.images));
    const removed = [...currentImages].filter((url) => !stillUsed.has(url));
    if (removed.length) await deleteImages(removed);

    return res.status(200).json({
      message: "Product updated successfully",
      product: product.toObject(),
    });
  } catch (error) {
    if (uploaded.length) await deleteImages(uploaded);
    return sendError(res, error, "Failed to update product");
  }
}
