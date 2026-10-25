import mongoose from "mongoose";

// NOTE: this schema is shared with the storefront (JVR) - do not rename fields.
const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    productOldPrice: {
      type: Number,
    },
    productPrice: {
      type: Number,
      required: true,
    },
    productVariants: [
      {
        color: {
          type: String,
          required: true,
        },
        sizes: [
          {
            size: {
              type: String,
              required: true,
            },
            stock: {
              type: Number,
              required: true,
            },
          },
        ],
        images: {
          type: [String],
          required: true,
        },
      },
    ],
    productDetails: {
      type: [String],
      required: true,
    },
    productCategory: {
      type: String,
      required: true,
    },
    productType: {
      type: String,
      required: true,
    },
    productBrand: {
      type: String,
      required: true,
    },
  },
  {
    strict: true,
    timestamps: false,
  }
);

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
