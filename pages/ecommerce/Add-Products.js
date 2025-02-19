import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import styles from "../../styles/CreateProduct.module.scss";
import { useAddProductsMutation } from "@/utils/api/ProductsApi";

const RichTextEditor = dynamic(() => import("@mantine/rte"), { ssr: false });

const CreateProduct = () => {
  const [addProduct, { isLoading }] = useAddProductsMutation();
  
  // State structure matching backend requirements
  const [formData, setFormData] = useState({
    productName: "",
    productPrice: "",
    productOldPrice: "",
    productCategory: "",
    productType: "",
    productBrand: "",
    productDetails: [""], // Array for product details
  });

  // Variants state matching backend structure
  const [variants, setVariants] = useState([
    {
      color: "",
      sizes: [{ size: "", stock: 0 }],
      images: [], // For storing File objects
    },
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const processedValue = e.target.type === "number" ? 
      Number(value) || "" : 
      value;
    
    setFormData({
      ...formData,
      [name]: processedValue,
    });
  };

  const handleVariantChange = (index, key, value) => {
    const updatedVariants = [...variants];
    updatedVariants[index][key] = value;
    setVariants(updatedVariants);
  };

  const handleVariantImageChange = (variantIndex, e) => {
    const files = Array.from(e.target.files);
    const updatedVariants = [...variants];
    updatedVariants[variantIndex].images = files; // Store File objects directly
    setVariants(updatedVariants);
  };

  const handleSizeChange = (variantIndex, sizeIndex, field, value) => {
    const updatedVariants = [...variants];
    const processedValue = field === "stock" ? Number(value) || 0 : value;
    updatedVariants[variantIndex].sizes[sizeIndex][field] = processedValue;
    setVariants(updatedVariants);
  };

  const addSize = (variantIndex) => {
    const updatedVariants = [...variants];
    updatedVariants[variantIndex].sizes.push({ size: "", stock: 0 });
    setVariants(updatedVariants);
  };

  const removeSize = (variantIndex, sizeIndex) => {
    const updatedVariants = [...variants];
    updatedVariants[variantIndex].sizes.splice(sizeIndex, 1);
    setVariants(updatedVariants);
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      { color: "", sizes: [{ size: "", stock: 0 }], images: [] },
    ]);
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();

    // Basic fields - ensure proper types
    formDataToSend.append('productName', String(formData.productName).trim());
    formDataToSend.append('productPrice', String(formData.productPrice));
    formDataToSend.append('productOldPrice', String(formData.productOldPrice || '0'));
    formDataToSend.append('productCategory', String(formData.productCategory).trim());
    formDataToSend.append('productType', String(formData.productType).trim());
    formDataToSend.append('productBrand', String(formData.productBrand).trim());

    // Handle product details - ensure it's an array of strings
    const details = formData.productDetails[0] || '';
    formDataToSend.append('productDetails', JSON.stringify([details]));

    // Process variants - ensure proper types for each field
    const processedVariants = variants.map(variant => ({
        color: String(variant.color).trim(),
        sizes: variant.sizes.map(size => ({
            size: String(size.size).trim(),
            stock: parseInt(size.stock, 10) || 0
        })),
        images: [] // Images will be handled separately
    }));
    
    formDataToSend.append('productVariants', JSON.stringify(processedVariants));

    // Handle variant images
    variants.forEach((variant, variantIndex) => {
        if (variant.images && variant.images.length > 0) {
            variant.images.forEach((image, imageIndex) => {
                if (image instanceof File) {
                    formDataToSend.append(`variantImages_${variantIndex}`, image);
                }
            });
        }
    });

    try {
        const response = await addProduct(formDataToSend).unwrap();
        alert("Product added successfully!");
        
        // Reset form
        setFormData({
            productName: "",
            productPrice: "",
            productOldPrice: "",
            productCategory: "",
            productType: "",
            productBrand: "",
            productDetails: [""]
        });

        setVariants([{
            color: "",
            sizes: [{ size: "", stock: 0 }],
            images: []
        }]);
    } catch (err) {
        console.error("Error details:", err);
        alert("Error adding product: " + (err.data?.message || "Unknown error"));
    }
};


  return (
    <div className={styles["product-creation"]}>
      <div className={styles["page-header"]}>
        <h1>Add Products</h1>
        <nav className={styles.breadcrumb}>
          <Link href="/">Dashboard</Link>
          <span>/</span>
          <span>Add Products</span>
        </nav>
      </div>

      <div className={styles.card}>
        <div className={styles["card-content"]}>
          <form onSubmit={handleSubmit} className={styles["product-form"]}>
            <div className={styles["form-group"]}>
              <label>Product Name</label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className={styles["form-group"]}>
              <label>Product category</label>
              <select
                name="productCategory"
                value={formData.productCategory}
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
              {formData.productCategory === "Mens" || formData.productCategory === "Women" ? (
                <select
                  name="productType"
                  value={formData.productType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a Type</option>
                  {formData.productCategory === "Mens"
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
                <select
                  name="productType"
                  value={formData.productType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a Type</option>
                  <option value="set">set</option>
                </select>
              )}
            </div>

            <div className={styles["form-group"]}>
              <label>Brand</label>
              <input
                type="text"
                name="productBrand"
                value={formData.productBrand}
                onChange={handleChange}
                placeholder="Enter brand name"
                required
              />
            </div>

            <div className={styles["form-row"]}>
              <div className={styles["form-group"]}>
                <label>Price</label>
                <input
                  type="number"
                  name="productPrice"
                  value={formData.productPrice}
                  onChange={handleChange}
                  placeholder="₹0"
                  required
                  min="0"
                />
              </div>
              <div className={styles["form-group"]}>
                <label>Old Price</label>
                <input
                  type="number"
                  name="productOldPrice"
                  value={formData.productOldPrice}
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
                        handleVariantChange(variantIndex, "color", e.target.value)
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
                      onChange={(e) => handleVariantImageChange(variantIndex, e)}
                      required={variant.images.length === 0}
                      className={styles["button"]}
                    />
                  </div>

                  <div className={styles["sizes-section"]}>
                    <h5>Sizes</h5>
                    {variant.sizes.map((size, sizeIndex) => (
                      <div key={sizeIndex} className={styles["size-row"]}>
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
                          {formData.productCategory === "Kids"
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
                value={formData.productDetails[0] || ""}
                onChange={(value) =>
                  setFormData(prev => ({
                    ...prev,
                    productDetails: [value]
                  }))
                }
              />
            </div>

            <div className={styles["form-actions"]}>
              <button
                type="submit"
                className={`${styles.btn} ${styles["btn-primary"]} ${styles["submit-btn"]}`}
                disabled={isLoading}
              >
                {isLoading ? "Adding..." : "Add Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProduct;