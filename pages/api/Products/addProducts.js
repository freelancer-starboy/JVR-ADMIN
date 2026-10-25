import Product from "lib/Models/AddProduct";
import connectDb from "lib/database/db";
import { HttpError, rejectMethod, sendError } from "lib/http";
import parseForm from "lib/products/parseForm";
import { readProductFields, readVariants, variantFiles } from "lib/products/formPayload";
import { deleteImages, isCloudinaryConfigured, uploadImages } from "lib/cloudinary";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (rejectMethod(req, res, ["POST"])) return;

  if (!isCloudinaryConfigured()) {
    return res.status(500).json({ message: "Image uploads are not configured (CLOUDINARY_* env vars missing)" });
  }

  const uploaded = [];

  try {
    const { fields, files } = await parseForm(req);
    const basicFields = readProductFields(fields);
    const variants = readVariants(fields);

    variants.forEach((variant, index) => {
      if (variantFiles(files, index).length === 0) {
        throw new HttpError(400, `Variant ${index + 1} (${variant.color}): add at least one image`);
      }
    });

    // Validate everything before uploading so a bad form doesn't leave orphaned images
    const draft = new Product({
      ...basicFields,
      productVariants: variants.map(({ color, sizes }) => ({ color, sizes, images: ["pending"] })),
    });
    const validationError = draft.validateSync();
    if (validationError) throw new HttpError(400, validationError.message);

    await connectDb();

    const productVariants = [];
    for (let index = 0; index < variants.length; index++) {
      const { color, sizes } = variants[index];
      const images = await uploadImages(variantFiles(files, index));
      uploaded.push(...images);
      productVariants.push({ color, sizes, images });
    }

    const product = await Product.create({ ...basicFields, productVariants });

    return res.status(201).json({
      message: "Product added successfully",
      product: product.toObject(),
    });
  } catch (error) {
    if (uploaded.length) await deleteImages(uploaded);
    return sendError(res, error, "Failed to add product");
  }
}
