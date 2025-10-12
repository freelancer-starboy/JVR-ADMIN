import formidable from 'formidable';
import { v2 as cloudinary } from "cloudinary";
import Product from 'lib/Models/AddProduct';
import connectDb from 'lib/database/db';

export const config = {
  api: {
    bodyParser: false,
  },
};

cloudinary.config({
  cloud_name: "drojxcxa1",
  api_key: "316898787323286",
  api_secret: "en2gIyAB52RDFk7d3VN9K0ua3LM",
});

// Helper function to extract value from formidable field
const getFieldValue = (field) => {
  if (Array.isArray(field)) {
    return field[0];
  }
  return field;
};

// Helper function to extract public_id from Cloudinary URL
const getPublicIdFromUrl = (url) => {
  try {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const publicId = `products/${filename.split('.')[0]}`;
    return publicId;
  } catch (error) {
    console.error('Error extracting public_id:', error);
    return null;
  }
};

// Helper function to delete image from Cloudinary
const deleteCloudinaryImage = async (imageUrl) => {
  try {
    const publicId = getPublicIdFromUrl(imageUrl);
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
      console.log(`Deleted image: ${publicId}`);
    }
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
  }
};

export default async function handler(req, res) {
  if (req.method !== 'PUT' && req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDb();

    const [fields, files] = await new Promise((resolve, reject) => {
      const form = formidable({ multiples: true });
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // DEBUG: Log raw fields
    console.log('Raw fields from formidable:', JSON.stringify(fields, null, 2));

    // Get product ID - properly extract from formidable array
    const productId = String(getFieldValue(fields.productId)).trim();
    
    console.log('Product ID:', productId);

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // Check if product exists
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    console.log('Existing product FULL DATA:', JSON.stringify(existingProduct, null, 2));

    // Helper to capitalize first letter (for category/type matching)
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

    // Parse and validate basic fields - properly extract values
    const basicFields = {
      productName: String(getFieldValue(fields.productName)).trim(),
      productPrice: Number(getFieldValue(fields.productPrice)) || 0,
      productOldPrice: Number(getFieldValue(fields.productOldPrice)) || 0,
      productCategory: String(getFieldValue(fields.productCategory)).trim(),
      productType: capitalize(String(getFieldValue(fields.productType)).trim()),
      productBrand: String(getFieldValue(fields.productBrand)).trim(),
      productDetails: JSON.parse(getFieldValue(fields.productDetails) || '[]')
    };

    console.log('Parsed basic fields:', basicFields);

    // Validate required fields
    if (!basicFields.productName || !basicFields.productPrice || 
        !basicFields.productCategory || !basicFields.productType || 
        !basicFields.productBrand) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Parse variants data
    let variantsData;
    try {
      variantsData = JSON.parse(getFieldValue(fields.productVariants) || '[]');
      console.log('Parsed variants data:', variantsData);
    } catch (error) {
      console.error('Error parsing variants:', error);
      return res.status(400).json({ message: "Invalid variants data format" });
    }

    // Parse images to remove (array of image URLs)
    let imagesToRemove = [];
    try {
      imagesToRemove = JSON.parse(getFieldValue(fields.imagesToRemove) || '[]');
      console.log('Images to remove:', imagesToRemove);
    } catch (error) {
      console.error('Error parsing imagesToRemove:', error);
    }

    // Delete removed images from Cloudinary
    if (imagesToRemove.length > 0) {
      await Promise.all(
        imagesToRemove.map(imageUrl => deleteCloudinaryImage(imageUrl))
      );
    }

    // Process variants and upload new images
    const processedVariants = await Promise.all(variantsData.map(async (variant, index) => {
      // Get existing images for this variant (images to keep)
      const existingImages = variant.existingImages || [];
      
      // Get new images to upload
      const variantImages = files[`variantImages_${index}`];
      let uploadedUrls = [];

      // Upload new images if any
      if (variantImages) {
        const imageArray = Array.isArray(variantImages) ? variantImages : [variantImages];
        
        uploadedUrls = await Promise.all(
          imageArray.map(image => 
            new Promise((resolve, reject) => {
              cloudinary.uploader.upload(
                image.filepath,
                { folder: "products" },
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result.secure_url);
                }
              );
            })
          )
        );
      }

      // Combine existing images with newly uploaded ones
      const allImages = [...existingImages, ...uploadedUrls];

      // Validate that variant has at least one image
      if (allImages.length === 0) {
        throw new Error(`Variant ${index + 1} must have at least one image`);
      }

      return {
        color: String(variant.color).trim(),
        sizes: variant.sizes.map(size => ({
          size: String(size.size).trim(),
          stock: Number(size.stock) || 0
        })),
        images: allImages
      };
    }));

    console.log('Processed variants:', processedVariants);

    // Update product with validated data
    const updatedProductData = {
      ...basicFields,
      productVariants: processedVariants
    };

    console.log('Data to update:', updatedProductData);

    // ALTERNATIVE FIX: Use .save() method instead of findByIdAndUpdate
    // This ensures Mongoose middleware runs properly
    try {
      const productToUpdate = await Product.findById(productId);
      
      if (!productToUpdate) {
        return res.status(404).json({ message: 'Product not found for update' });
      }

      // Update fields directly on the document
      Object.keys(updatedProductData).forEach(key => {
        productToUpdate[key] = updatedProductData[key];
      });

      // Save the document
      const savedProduct = await productToUpdate.save();
      
      console.log('Update result: SUCCESS');
      console.log('Updated product name:', savedProduct.productName);
      
      // Verify with fresh read
      const verifiedProduct = await Product.findById(productId).lean().exec();
      console.log('Verified product name from DB:', verifiedProduct?.productName);

      return res.status(200).json({ 
        message: "Product updated successfully", 
        product: verifiedProduct
      });
      
    } catch (updateError) {
      console.error('Update error details:', updateError);
      throw updateError;
    }

  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({ 
      message: "Failed to update product", 
      error: error.message 
    });
  }
}