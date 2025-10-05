import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const ProductDescription = ({ productData }) => {
  const product = productData || {};
  const hasDescription = product.description && product.description.length > 0;

  return (
    <>
      <div className='product-description'>
        {/* Main Description */}
         <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Product Description
            </Typography>
        {hasDescription ? (
          <Box 
            dangerouslySetInnerHTML={{ __html: product.description[0] }}
            sx={{ mb: 2 }}
          />
        ) : (
          <p>No detailed description available for this product.</p>
        )}

        {/* Product Specifications */}
        {product.type || product.category || product.brand ? (
          <Box sx={{ mt: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Product Specifications
            </Typography>
            <ul>
              {product.brand && (
                <li><strong>Brand:</strong> {product.brand}</li>
              )}
              {product.category && (
                <li><strong>Category:</strong> {product.category}</li>
              )}
              {product.type && (
                <li><strong>Type:</strong> {product.type}</li>
              )}
            </ul>
          </Box>
        ) : null}

        {/* Additional Information - You can customize this based on your needs */}
        {/* <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Additional Information
          </Typography>
          <ul>
            <li>High-quality materials ensuring durability and comfort</li>
            <li>Carefully crafted with attention to detail</li>
            <li>Easy to care for and maintain</li>
            <li>Perfect for various occasions and styles</li>
          </ul>
        </Box> */}

        {/* Care Instructions */}
        {/* <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Care Instructions
          </Typography>
          <ul>
            <li>Follow the care label instructions for best results</li>
            <li>Machine wash or hand wash as recommended</li>
            <li>Avoid using harsh detergents or bleach</li>
            <li>Dry according to fabric requirements</li>
          </ul>
        </Box> */}

        {/* Return Policy */}
        {/* <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Return Policy:</strong> We offer a hassle-free return policy. 
            If you're not satisfied with your purchase, you can return it within 
            the specified period as per our return policy guidelines.
          </Typography>
        </Box> */}
      </div>
    </>
  );
}

export default ProductDescription;