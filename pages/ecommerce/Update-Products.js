import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import styles from "../../styles/CreateProduct.module.scss";

const RichTextEditor = dynamic(() => import("@mantine/rte"), { ssr: false });

const UpdateProduct = () => {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    category: "",
    price: "",
    discountPrice: "",
    description: "",
  });

  const [variants, setVariants] = useState([
    {
      color: "",
      sizes: [{ size: "", stock: 0 }],
      images: [], // Array to store variant images
      imageFiles: [], // Array to store image files for preview
    },
  ]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      variants.forEach((variant) => {
        variant.images.forEach((url) => URL.revokeObjectURL(url));
      });
    };
  }, []);

  // Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle variant input changes
  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  // Handle variant image changes
  const handleVariantImageChange = (variantIndex, e) => {
    const files = Array.from(e.target.files);
    const newVariants = [...variants];

    // Create URLs for preview
    const imageURLs = files.map((file) => URL.createObjectURL(file));

    newVariants[variantIndex].imageFiles = files;
    newVariants[variantIndex].images = imageURLs;

    setVariants(newVariants);
  };

  // Handle size changes within variants
  const handleSizeChange = (variantIndex, sizeIndex, field, value) => {
    const newVariants = [...variants];
    newVariants[variantIndex].sizes[sizeIndex][field] = value;
    setVariants(newVariants);
  };

  // Add/remove variants and sizes
  const addSize = (variantIndex) => {
    const newVariants = [...variants];
    newVariants[variantIndex].sizes.push({ size: "", stock: 0 });
    setVariants(newVariants);
  };

  const removeSize = (variantIndex, sizeIndex) => {
    const newVariants = [...variants];
    newVariants[variantIndex].sizes.splice(sizeIndex, 1);
    setVariants(newVariants);
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        color: "",
        sizes: [{ size: "", stock: 0 }],
        images: [],
        imageFiles: [],
      },
    ]);
  };

  const removeVariant = (index) => {
    // Clean up object URLs before removing variant
    variants[index].images.forEach((url) => URL.revokeObjectURL(url));
    setVariants(variants.filter((_, i) => i !== index));
  };

  // Upload images to Cloudinary
  const uploadImagesToCloudinary = async (images) => {
    const uploadedImageUrls = [];

    for (const image of images) {
      const imageData = new FormData();
      imageData.append("file", image);
      imageData.append("upload_preset", "your_upload_preset");

      try {
        const res = await fetch(
          "https://api.cloudinary.com/v1_1/your_cloud_name/image/upload",
          {
            method: "POST",
            body: imageData,
          }
        );

        const data = await res.json();
        uploadedImageUrls.push(data.secure_url);
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }

    return uploadedImageUrls;
  };

  // Form validation
  const validateForm = () => {
    if (!formData.name || !formData.price) {
      alert("Name and price are required");
      return false;
    }

    for (const variant of variants) {
      if (!variant.color || variant.sizes.some((s) => !s.size)) {
        alert("All variants must have color and size specified");
        return false;
      }
      if (variant.imageFiles.length === 0) {
        alert("Each variant must have at least one image");
        return false;
      }
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // Upload variant images and create final variant data
      const finalVariants = await Promise.all(
        variants.map(async (variant) => {
          const uploadedVariantImages = await uploadImagesToCloudinary(
            variant.imageFiles
          );
          return {
            ...variant,
            images: uploadedVariantImages,
            imageFiles: undefined, // Remove the files from the final data
          };
        })
      );

      const productData = {
        ...formData,
        variants: finalVariants,
      };

      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        alert("Product created successfully!");
      } else {
        throw new Error("Error creating product");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error creating product: " + error.message);
    }
  };

  return (
    <div className={styles["product-creation"]}>
      <div className={styles["page-header"]}>
        <h1>Update Products</h1>
        <nav className={styles.breadcrumb}>
          <Link href="/">Dashboard</Link>
          <span>/</span>
          <span>Update Products</span>
        </nav>
      </div>

      <div className={styles.card}>
        <div className={styles["card-content"]}>
          <form onSubmit={handleSubmit} className={styles["product-form"]}>
            <div className={styles["form-group"]}>
              <label>Product Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className={styles["form-group"]}>
              <label>Product category</label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select a category</option>
                <option value="Mens">Mens</option>
                <option value="Women">Women</option>
                <option value="Kids">Kids</option>
              </select>
            </div>

            <div className={styles["form-group"]}>
              <label>Product Type</label>
              {/* Conditional Rendering for Product Type */}
              {formData.category === "Mens" || formData.category === "Women" ? (
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a Type</option>
                  {formData.category === "Mens"
                    ? ["Shirts", "Pants", "Tshirts"].map((menstype) => (
                        <option key={menstype} value={menstype}>
                          {menstype}
                        </option>
                      ))
                    : ["Kurta", "Saree", "Leggins", "Shirts", "Pants"].map(
                        (womentype) => (
                          <option key={womentype} value={womentype}>
                            {womentype}
                          </option>
                        )
                      )}
                </select>
              ) : (
                <select>
                  <option value="">Select a Type</option>
                  <option value="set">set</option>
                  {/* <option value="1 To 2 year">1 To 2 year</option>  
                <option value="2 To 3 year">2 To 3 year</option>
                <option value="3 To 4 year">3 To 4 year</option> */}
                </select>
              )}
            </div>

            <div className={styles["form-row"]}>
              <div className={styles["form-group"]}>
                <label>Price</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="₹0"
                  required
                  min="0"
                />
              </div>
              <div className={styles["form-group"]}>
                <label>Discount Price</label>
                <input
                  type="number"
                  name="discountPrice"
                  value={formData.discountPrice}
                  onChange={handleChange}
                  placeholder="₹0"
                  min="0"
                />
              </div>
            </div>

            <div className={styles["variants-section"]}>
              <h3>Product Variants</h3>
              {variants.map((variant, variantIndex) => (
                <div key={variantIndex} className={styles["variant-card"]}>
                  <div className={styles["variant-header"]}>
                    <h4>Variant {variantIndex + 1}</h4>
                    {variants.length > 1 && (
                      <button
                        type="button"
                        className={`${styles.btn} ${styles["btn-danger"]}`}
                        onClick={() => removeVariant(variantIndex)}
                      >
                        Remove Variant
                      </button>
                    )}
                  </div>

                  <div className={styles["form-group"]}>
                    <label>Color</label>
                    <input
                      type="text"
                      value={variant.color}
                      onChange={(e) =>
                        handleVariantChange(
                          variantIndex,
                          "color",
                          e.target.value
                        )
                      }
                      placeholder="Enter color"
                      required
                    />
                  </div>

                  <div className={styles["forms-group"]}>
                    <label>Variant Images</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) =>
                        handleVariantImageChange(variantIndex, e)
                      }
                      required={variant.images.length === 0}
                      className={styles["button"]}
                    />
                    {variant.images.length > 0 && (
                      <div className={styles["image-preview"]}>
                        {variant.images.map((url, imgIndex) => (
                          <img
                            key={imgIndex}
                            src={url}
                            alt={`Variant ${variantIndex + 1} preview ${
                              imgIndex + 1
                            }`}
                            className={styles["preview-image"]}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={styles["sizes-section"]}>
                    <h5>Sizes</h5>
                    {variant.sizes.map((size, sizeIndex) => (
                      <div key={sizeIndex} className={styles["size-row"]}>
                        {/* Conditional Rendering for Shirt and Pants Sizes */}

                        <select
                          value={size.size}
                          onChange={(e) =>
                            handleSizeChange(
                              variantIndex,
                              sizeIndex,
                              "size",
                              e.target.value
                            )
                          }
                          required
                          className={styles["size-row"]}
                        >
                          <option value="">Select Size</option>
                          {formData.category === "Kids"
                            ? [
                                "0 To 1 year",
                                "1 To 2 year",
                                "2 To 3 year",
                                "4 To 5 year",
                              ].map((KidsSize) => (
                                <option key={KidsSize} value={KidsSize}>
                                  {KidsSize}
                                </option>
                              ))
                            : [
                                "S",
                                "M",
                                "L",
                                "XL",
                                "XXL",
                                "XXXL",
                                "32",
                                "34",
                                "36",
                                "38",
                                "40",
                              ].map((Size) => (
                                <option key={Size} value={Size}>
                                  {Size}
                                </option>
                              ))}
                        </select>

                        <input
                          type="number"
                          value={size.stock}
                          onChange={(e) =>
                            handleSizeChange(
                              variantIndex,
                              sizeIndex,
                              "stock",
                              Number(e.target.value)
                            )
                          }
                          placeholder="Stock"
                          required
                          min="0"
                          className={styles["size-row"]}
                        />

                        {variant.sizes.length > 1 && (
                          <button
                            type="button"
                            className={`${styles.btn} ${styles["btn-danger"]}`}
                            onClick={() => removeSize(variantIndex, sizeIndex)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className={`${styles.btn} ${styles["btn-outline"]}`}
                      onClick={() => addSize(variantIndex)}
                    >
                      Add Size
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className={`${styles.btn} ${styles["btn-outline"]} ${styles["add-variant-btn"]}`}
                onClick={addVariant}
              >
                Add Variant
              </button>
            </div>

            <div className={styles["form-group"]}>
              <label>Description</label>
              <RichTextEditor
                value={formData.description}
                onChange={(value) =>
                  handleChange({ target: { name: "description", value } })
                }
              />
            </div>

            <div className={styles["form-actions"]}>
              <button
                type="submit"
                className={`${styles.btn} ${styles["btn-primary"]} ${styles["submit-btn"]}`}
              >
                Update Products
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateProduct;
