import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import StarIcon from "@mui/icons-material/Star";
import Button from "@mui/material/Button";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import styles from "@/components/eCommerce/ProductDetails/ProductDetailsContent.module.css";
import ProductDescription from "./ProductDescription";
import ProductReviews from "./ProductReviews";
import { useRouter } from "next/router";

const ProductDetailsContent = ({ productData, variantData, reviewData }) => {
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const router = useRouter();
  // Fallback values
  const product = productData || {};
  console.log("product", product)
  const variants = variantData || [];
  const reviews = reviewData || { reviews: [], total: 0, averageRating: 0 };

  // Get current variant
  const currentVariant = variants[selectedVariant] || {};
  const currentImages = currentVariant.existingImages || ["/images/product-preview.png"];
  
  // Calculate total stock for current variant
  const totalStock = currentVariant.sizes?.reduce((sum, item) => sum + item.stock, 0) || 0;

  // Get available sizes for current variant
  const availableSizes = currentVariant.sizes || [];

   const handleUpdateClick = (id) => {
    router.push(`/ecommerce/updateProduct/${id}`);
  };

  // Get selected size stock
  const selectedSizeStock = selectedSize 
    ? availableSizes.find(s => s.size === selectedSize)?.stock || 0 
    : totalStock;

  return (
    <>
      <Card
        sx={{
          boxShadow: "none",
          borderRadius: "10px",
          p: "25px",
          mb: "15px",
        }}
      >
        <Grid
          container
          rowSpacing={2}
          alignItems="center"
          columnSpacing={{ xs: 1, sm: 1, md: 1, lg: 3, xl: 4 }}
        >
          <Grid item xs={12} md={12} lg={5} xl={5}>
            <Swiper
              navigation={true}
              modules={[Navigation]}
              className="product-img-slider"
            >
              {currentImages.map((image, index) => (
                <SwiperSlide key={index}>
                  <img 
                    src={image} 
                    alt={`${product.name || 'Product'} - Image ${index + 1}`}
                    style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </Grid>

          <Grid item xs={12} md={12} lg={7} xl={7}>
            <Box>
              <Typography as="h4" fontWeight="500" fontSize="18px" mb="10px">
                {product.name || 'Product Name'}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: "15px",
                }}
              >
                {Array.from({ length: Math.floor(reviews.averageRating || 0) }).map((_, i) => (
                  <StarIcon key={i} sx={{ color: "#FFBC2B", fontSize: 18 }} />
                ))}
                <Typography as="h4" fontSize="13px" className="ml-1">
                  {reviews.averageRating || 0} ({reviews.total || 0} {reviews.total === 1 ? 'review' : 'reviews'})
                </Typography>
              </Box>

              <Typography fontSize="15px" fontWeight="500" mb="15px">
                Price:{" "}
                {product.price && product.discountPrice && product.price > product.discountPrice && (
                  <del
                    style={{
                      fontSize: "12px",
                      color: "#95959d",
                    }}
                    className='mr-5px ml-5px'
                  >
                    ${product.price}
                  </del>
                )}{" "}
                ${product.discountPrice || product.price || 0}
              </Typography>

              {product.description && product.description.length > 0 && (
                <Box 
                  fontSize="14px" 
                  mb="15px"
                  dangerouslySetInnerHTML={{ __html: product.description[0] }}
                />
              )}

              <ul className={styles.metaTagList}>
                <li>
                  <span>Category:</span> {product.category || 'N/A'}
                </li>
                <li>
                  <span>Type:</span> {product.type || 'N/A'}
                </li>
                {product.brand && (
                  <li>
                    <span>Brand:</span> {product.brand}
                  </li>
                )}
                <li>
                  <span>Availability:</span> {totalStock > 0 ? `In Stock ${selectedSizeStock} Items` : 'Out of Stock'}
                </li>
              </ul>

              {/* Color Selection */}
              {variants.length > 0 && (
                <Box mb="15px">
                  <Typography fontSize="14px" fontWeight="500" mb="8px">
                    Color:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {variants.map((variant, index) => (
                      <Box
                        key={index}
                        onClick={() => {
                          setSelectedVariant(index);
                          setSelectedSize(null);
                        }}
                        sx={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: variant.color,
                          border: selectedVariant === index ? '3px solid #000' : '2px solid #ddd',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          '&:hover': {
                            transform: 'scale(1.1)',
                          }
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Size Selection */}
              {availableSizes.length > 0 && (
                <Box mb="15px">
                  <Typography fontSize="14px" fontWeight="500" mb="8px">
                    Size:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {availableSizes.map((sizeObj, index) => (
                      <Button
                        key={index}
                        onClick={() => setSelectedSize(sizeObj.size)}
                        disabled={sizeObj.stock === 0}
                        variant={selectedSize === sizeObj.size ? 'contained' : 'outlined'}
                        sx={{
                          minWidth: '50px',
                          height: '40px',
                          opacity: sizeObj.stock === 0 ? 0.5 : 1,
                          cursor: sizeObj.stock === 0 ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {sizeObj.size}
                      </Button>
                    ))}
                  </Box>
                </Box>
              )}

              <ul className={styles.socialLink}>
                <li>
                  <span>Share :</span>
                </li>
                <li>
                  <a
                    href="https://www.facebook.com/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <i className="ri-facebook-line"></i>
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.twitter.com/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <i className="ri-twitter-line"></i>
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.instagram.com/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <i className="ri-instagram-line"></i>
                  </a>
                </li>
              </ul>

              <Button
                variant="contained"
                startIcon={<ShoppingCartIcon sx={{ color: "#fff !important" }} />}
                onClick={() => handleUpdateClick(product._id)}
                sx={{
                  p: "10px 25px",
                  color: "#fff !important"
                }}
              >
                Update product
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Box mt={2}>
          <Tabs className="product-details-tabs">
            <TabList>
              <Tab>Description</Tab>
              <Tab>Reviews ({reviews.total || 0})</Tab>
            </TabList>

            <TabPanel>
              {/* ProductDescription */}
              <ProductDescription productData={product} />
            </TabPanel>

            <TabPanel>
              {/* ProductReviews */}
              <ProductReviews reviewData={reviews} />
            </TabPanel>
          </Tabs>
        </Box>
      </Card>
    </>
  );
};

export default ProductDetailsContent;