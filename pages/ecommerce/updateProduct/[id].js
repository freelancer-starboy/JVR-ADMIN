import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import styles from "../../../styles/CreateProduct.module.scss";
import { useRouter } from "next/router";
import { useGetProductByIdMutation, useUpdateProductMutation } from "@/utils/api/ProductsApi";
import { toast } from "react-toastify";

const RichTextEditor = dynamic(() => import("@mantine/rte"), { ssr: false });

const UpdateProduct = () => {
  const router = useRouter();
  const { id } = router.query;
  const [getProduct, { isLoading, isError, error }] = useGetProductByIdMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    category: "",
    price: "",
    discountPrice: "",
    brand: "",
    description: [""],
  });

  const [variants, setVariants] = useState([
    {
      color: "",
      sizes: [{ size: "", stock: 0 }],
      images: [],
      imageFiles: [],
    },
  ]);

  const [imagesToRemove, setImagesToRemove] = useState([]);

  // Fetch product details
  useEffect(() => {
    if (!id) return;

    const getProductById = async () => {
      try {
        const response = await getProduct({ productId: id }).unwrap();
        const product = response.product;
        
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
          if (lowerType === "tshirt" || lowerType === "tshirts") return "Tshirts";
          if (lowerType === "kurta") return "Kurta";
          if (lowerType === "saree") return "Saree";
          if (lowerType === "leggins" || lowerType === "leggings") return "Leggins";
          if (lowerType === "set") return "set";
          return type;
        };
        
        // Update form data
        setFormData({
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
          const mappedVariants = product.productVariants.map(variant => ({
            color: variant.color || "",
            sizes: variant.sizes && variant.sizes.length > 0 
              ? variant.sizes.map(s => ({ 
                  size: s.size || "", 
                  stock: Number(s.stock) || 0 
                }))
              : [{ size: "", stock: 0 }],
            images: [],
            imageFiles: [],
            existingImages: variant.images || [], // Track existing images separately
          }));
          setVariants(mappedVariants);
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

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      variants.forEach((variant) => {
        variant.images.forEach((url) => {
          if (url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        });
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

  // Remove existing image
  const removeExistingImage = (variantIndex, imageIndex) => {
    const newVariants = [...variants];
    const imageUrl = newVariants[variantIndex].existingImages[imageIndex];
    
    // Add to images to remove list
    setImagesToRemove(prev => [...prev, imageUrl]);
    
    // Remove from existing images
    newVariants[variantIndex].existingImages = newVariants[variantIndex].existingImages.filter(
      (_, idx) => idx !== imageIndex
    );
    
    setVariants(newVariants);
  };

  // Remove new image preview
  const removeNewImage = (variantIndex, imageIndex) => {
    const newVariants = [...variants];
    
    // Revoke the blob URL
    URL.revokeObjectURL(newVariants[variantIndex].images[imageIndex]);
    
    // Remove from preview images
    newVariants[variantIndex].images = newVariants[variantIndex].images.filter(
      (_, idx) => idx !== imageIndex
    );
    
    // Remove from image files
    newVariants[variantIndex].imageFiles = Array.from(newVariants[variantIndex].imageFiles).filter(
      (_, idx) => idx !== imageIndex
    );
    
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
        existingImages: [],
      },
    ]);
  };

  const removeVariant = (index) => {
    // Clean up object URLs before removing variant
    variants[index].images.forEach((url) => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    // Add all existing images of this variant to removal list
    if (variants[index].existingImages) {
      setImagesToRemove(prev => [...prev, ...variants[index].existingImages]);
    }
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
      toast.error("Name and price are required");
      return false;
    }

    for (const variant of variants) {
      if (!variant.color || variant.sizes.some((s) => !s.size)) {
        toast.error("All variants must have color and size specified");
        return false;
      }
      // Check if variant has either existing images or new image files
      if (!variant.existingImages?.length && !variant.imageFiles?.length) {
        toast.error("Each variant must have at least one image");
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
      // Create FormData for multipart upload
      const formDataToSend = new FormData();
      
      // Add basic fields
      formDataToSend.append('productName', formData.name);
      formDataToSend.append('productCategory', formData.category.toLowerCase());
      formDataToSend.append('productType', formData.type.toLowerCase());
      formDataToSend.append('productOldPrice', formData.price);
      formDataToSend.append('productPrice', formData.discountPrice);
      formDataToSend.append('productBrand', formData.brand || 'Generic');
      formDataToSend.append('productDetails', JSON.stringify(formData.description));
      formDataToSend.append('productId', id);
      
      // Add images to remove
      formDataToSend.append('imagesToRemove', JSON.stringify(imagesToRemove));
      
      // Prepare variants data
      const variantsForSubmit = variants.map((variant) => ({
        color: variant.color,
        sizes: variant.sizes,
        existingImages: variant.existingImages || [],
      }));
      
      formDataToSend.append('productVariants', JSON.stringify(variantsForSubmit));
      
      // Add variant images
      variants.forEach((variant, index) => {
        if (variant.imageFiles && variant.imageFiles.length > 0) {
          variant.imageFiles.forEach((file) => {
            formDataToSend.append(`variantImages_${index}`, file);
          });
        }
      });

      const response = await updateProduct(formDataToSend).unwrap();

      toast.success(response.message || "Product updated successfully!");
      // router.push("/products"); // Redirect to products list
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error updating product: " + (error?.data?.message || error.message));
    }
  };

  if (isLoading) return <p>Loading product details...</p>;
  if (isError) return <p>Error: {error?.data?.message || error?.error}</p>;

  return (
    <div className={styles["product-creation"]}>
      <div className={styles["page-header"]}>
        <h1>Update Product</h1>
        <nav className={styles.breadcrumb}>
          <Link href="/">Dashboard</Link>
          <span>/</span>
          <span>Update Product</span>
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
              <label>Product Category</label>
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
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a Type</option>
                  <option value="set">set</option>
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

            <div className={styles["form-group"]}>
              <label>Product Brand</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="Enter product brand"
                required
              />
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
                      className={styles["button"]}
                    />
                    
                    {/* Display existing images */}
                    {variant.existingImages && variant.existingImages.length > 0 && (
                      <div className={styles["image-preview"]}>
                        <p>Existing Images:</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                          {variant.existingImages.map((url, imgIndex) => (
                            <div key={`existing-${imgIndex}`} style={{ position: 'relative' }}>
                              <img
                                src={url}
                                alt={`Existing variant ${variantIndex + 1} image ${imgIndex + 1}`}
                                className={styles["preview-image"]}
                                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                              />
                              <button
                                type="button"
                                onClick={() => removeExistingImage(variantIndex, imgIndex)}
                                style={{
                                  position: 'absolute',
                                  top: '-5px',
                                  right: '-5px',
                                  background: 'red',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '25px',
                                  height: '25px',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Display new image previews */}
                    {variant.images.length > 0 && (
                      <div className={styles["image-preview"]}>
                        <p>New Images:</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                          {variant.images.map((url, imgIndex) => (
                            <div key={`new-${imgIndex}`} style={{ position: 'relative' }}>
                              <img
                                src={url}
                                alt={`New variant ${variantIndex + 1} preview ${imgIndex + 1}`}
                                className={styles["preview-image"]}
                                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                              />
                              <button
                                type="button"
                                onClick={() => removeNewImage(variantIndex, imgIndex)}
                                style={{
                                  position: 'absolute',
                                  top: '-5px',
                                  right: '-5px',
                                  background: 'red',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '25px',
                                  height: '25px',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
                value={formData.description[0] || ""}
                onChange={(value) =>
                  setFormData(prev => ({
                    ...prev,
                    description: [value]
                  }))
                }
              />
            </div>

            <div className={styles["form-actions"]}>
              <button
                type="submit"
                className={`${styles.btn} ${styles["btn-primary"]} ${styles["submit-btn"]}`}
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Update Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateProduct;