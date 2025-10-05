import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const ProductReviews = ({ reviewData }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const reviews = reviewData?.reviews || [];
  const hasReviews = reviews.length > 0;

  const openLightbox = (images, index) => {
    setSelectedImages(images);
    setSelectedImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setSelectedImages([]);
    setSelectedImageIndex(0);
  };

  if (!hasReviews) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No reviews yet. Be the first to review this product!
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Grid container spacing={3}>
        {reviews.map((review, index) => (
          <Grid key={review._id || index} item xs={12} md={6} lg={4}>
            <div className="review-card">
              <div className="content">
                <div className="reating">
                  {Array.from({ length: review?.rating || 0 }).map((_, i) => (
                    <i key={i} className="ri-star-fill"></i>
                  ))}
                </div>

                <p>{review?.comment || 'No comment provided'}</p>

                {/* Display review images with carousel if multiple */}
                {review?.imageUrls && review.imageUrls.length > 0 && (
                  <Box sx={{ mt: 2, mb: 2 }}>
                    {review.imageUrls.length === 1 ? (
                      // Single image - direct display
                      <img
                        src={review.imageUrls[0]}
                        alt={`Review ${index + 1} - Image 1`}
                        onClick={() => openLightbox(review.imageUrls, 0)}
                        style={{
                          width: '100%',
                          maxHeight: '200px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                        }}
                        onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
                        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                      />
                    ) : (
                      // Multiple images - carousel
                      <Swiper
                        navigation={true}
                        pagination={{ clickable: true }}
                        modules={[Navigation, Pagination]}
                        className="review-images-slider"
                        style={{ 
                          borderRadius: '8px',
                          '--swiper-navigation-size': '20px',
                        }}
                      >
                        {review.imageUrls.map((imageUrl, imgIndex) => (
                          <SwiperSlide key={imgIndex}>
                            <img
                              src={imageUrl}
                              alt={`Review ${index + 1} - Image ${imgIndex + 1}`}
                              onClick={() => openLightbox(review.imageUrls, imgIndex)}
                              style={{
                                width: '100%',
                                height: '200px',
                                objectFit: 'cover',
                                cursor: 'pointer',
                              }}
                            />
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    )}
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block', 
                        mt: 1, 
                        color: 'text.secondary',
                        textAlign: 'center'
                      }}
                    >
                      {review.imageUrls.length > 1 
                        ? `${review.imageUrls.length} images - Click to view full size` 
                        : 'Click to view full size'}
                    </Typography>
                  </Box>
                )}

                <img
                  src="/images/down-arrow.png"
                  alt="down-arrow"
                  className="down-arrow"
                />
              </div>
              <div className="info">
                <img 
                  src="/images/user1.png" 
                  alt={review?.user || 'User'} 
                />
                <h4>{review?.user || 'Anonymous'}</h4>
              </div>
            </div>
          </Grid>
        ))}
      </Grid>

      {/* Summary Section */}
      <Box sx={{ mt: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: '8px' }}>
        <Typography variant="h6" gutterBottom>
          Review Summary
        </Typography>
        <Typography variant="body2">
          Total Reviews: {reviewData?.total || 0}
        </Typography>
        <Typography variant="body2">
          Average Rating: {reviewData?.averageRating || 0} / 5
        </Typography>
      </Box>

      {/* Lightbox Modal for Full Image View */}
      <Dialog
        open={lightboxOpen}
        onClose={closeLightbox}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'rgba(0, 0, 0, 0.95)',
            boxShadow: 'none',
          }
        }}
      >
        <IconButton
          onClick={closeLightbox}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white',
            zIndex: 1,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.7)',
            }
          }}
        >
          <CloseIcon />
        </IconButton>
        
        <DialogContent sx={{ p: 0, bgcolor: 'transparent' }}>
          {selectedImages.length > 1 ? (
            <Swiper
              navigation={true}
              pagination={{ clickable: true }}
              modules={[Navigation, Pagination]}
              initialSlide={selectedImageIndex}
              style={{
                '--swiper-navigation-color': '#fff',
                '--swiper-pagination-color': '#fff',
              }}
            >
              {selectedImages.map((imageUrl, imgIndex) => (
                <SwiperSlide key={imgIndex}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      minHeight: '70vh',
                      p: 2,
                    }}
                  >
                    <img
                      src={imageUrl}
                      alt={`Full view ${imgIndex + 1}`}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '80vh',
                        objectFit: 'contain',
                      }}
                    />
                  </Box>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '70vh',
                p: 2,
              }}
            >
              <img
                src={selectedImages[0]}
                alt="Full view"
                style={{
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                }}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductReviews;