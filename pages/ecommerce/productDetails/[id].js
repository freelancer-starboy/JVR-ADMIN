import React, { useEffect, useState } from "react";
import ProductDetailsContent from "@/components/eCommerce/ProductDetails/ProductDetailsContent";
import Link from "next/link";
import styles from "@/styles/PageTitle.module.css";
import { useGetProductByIdMutation } from "@/utils/api/ProductsApi";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

export default function ProductDetails() {
  const [getProduct, { isLoading, isError, error }] =
    useGetProductByIdMutation();
  const router = useRouter();
  const { id } = router.query;
  const [formData, setFormData] = useState({
    _id : "",
    name: "",
    type: "",
    category: "",
    price: "",
    discountPrice: "",
    brand: "",
    description: [""],
  });

  const [reviews, setReviews] = useState({
    reviews : [],
    total : 0,
    averageRating : 0
  })

  const [variants, setVariants] = useState([
    {
      color: "",
      sizes: [{ size: "", stock: 0 }],
      images: [],
      imageFiles: [],
    },
  ]);
  useEffect(() => {
    if (!id) return;

    const getProductById = async () => {
      try {
        const response = await getProduct({ productId: id }).unwrap();
        const product = response.product;
        const reviews = response.reviews;

        // Normalize category name (backend uses lowercase, frontend uses capitalized)
        const normalizeCategory = (cat) => {
          if (!cat) return "";
          const lowerCat = cat.toLowerCase();
          if (lowerCat === "mens") return "Mens";
          if (lowerCat === "women") return "Women";
          if (lowerCat === "kids") return "Kids";
          return cat;
        };

        // Normalize type name
        const normalizeType = (type) => {
          if (!type) return "";
          const lowerType = type.toLowerCase();
          if (lowerType === "shirt" || lowerType === "shirts") return "Shirts";
          if (lowerType === "pant" || lowerType === "pants") return "Pants";
          if (lowerType === "tshirt" || lowerType === "tshirts")
            return "Tshirts";
          if (lowerType === "kurta") return "Kurta";
          if (lowerType === "saree") return "Saree";
          if (lowerType === "leggins" || lowerType === "leggings")
            return "Leggins";
          if (lowerType === "set") return "set";
          return type;
        };

        // Update form data
        setFormData({
          _id : product._id || "",
          name: product.productName || "",
          type: normalizeType(product.productType),
          category: normalizeCategory(product.productCategory),
          price: product.productOldPrice || "",
          discountPrice: product.productPrice || "",
          brand: product.productBrand || "",
          description: Array.isArray(product.productDetails)
            ? product.productDetails
            : [product.productDetails || ""],
        });

        // Update variants if they exist in the product
        if (product.productVariants && product.productVariants.length > 0) {
          const mappedVariants = product.productVariants.map((variant) => ({
            color: variant.color || "",
            sizes:
              variant.sizes && variant.sizes.length > 0
                ? variant.sizes.map((s) => ({
                    size: s.size || "",
                    stock: Number(s.stock) || 0,
                  }))
                : [{ size: "", stock: 0 }],
            images: [],
            imageFiles: [],
            existingImages: variant.images || [], // Track existing images separately
          }));
          setVariants(mappedVariants);
        }
        // Set Reviews
        if(reviews.length){
          const averageRating  = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
          setReviews({
            reviews : reviews,
            total : reviews.length,
            averageRating : averageRating
          })
        }
      } catch (error) {
        if (error.status === 404) {
          toast.error("Product not found!");
        } else if (error.status === 400) {
          toast.error("Invalid Product ID!");
        } else {
          toast.error("Something went wrong while fetching product.");
        }
      }
    };

    getProductById();
  }, [id, getProduct]);

  return (
    <>
      {/* Page title */}
      <div className={styles.pageTitle}>
        <h1>Product Details</h1>
        <ul>
          <li>
            <Link href="/">Dashboard</Link>
          </li>
          <li>Product Details</li>
        </ul>
      </div>

      <ProductDetailsContent productData={formData} variantData={variants} reviewData={reviews} />
    </>
  );
}
