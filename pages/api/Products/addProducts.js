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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
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

    // Helper to capitalize first letter (for category/type matching)
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

    // Parse and validate basic fields - properly extract values using getFieldValue
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

    // Process variants and upload images
    const processedVariants = await Promise.all(variantsData.map(async (variant, index) => {
      // Get variant images
      const variantImages = files[`variantImages_${index}`];
      if (!variantImages) {
        throw new Error(`Images are required for variant ${index + 1}`);
      }

      // Ensure variantImages is an array
      const imageArray = Array.isArray(variantImages) ? variantImages : [variantImages];

      // Upload images to Cloudinary
      const uploadedUrls = await Promise.all(
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

      // Validate that variant has at least one image
      if (uploadedUrls.length === 0) {
        throw new Error(`Variant ${index + 1} must have at least one image`);
      }

      return {
        color: String(variant.color).trim(),
        sizes: variant.sizes.map(size => ({
          size: String(size.size).trim(),
          stock: Number(size.stock) || 0
        })),
        images: uploadedUrls
      };
    }));

    console.log('Processed variants:', processedVariants);

    // Create product with validated data
    const productData = {
      ...basicFields,
      productVariants: processedVariants
    };

    console.log('Data to create:', productData);

    // Create new product
    console.log('About to save product with data:', JSON.stringify(productData, null, 2));
    
    // Validate the data before saving
    const newProduct = new Product(productData);
    
    // Run validation explicitly to catch errors
    const validationError = newProduct.validateSync();
    if (validationError) {
      console.error('Validation error:', validationError);
      return res.status(400).json({ 
        message: "Validation failed", 
        error: validationError.message 
      });
    }
    
    const savedProduct = await newProduct.save();

    console.log('Create result: SUCCESS');
    console.log('Saved product FULL:', JSON.stringify(savedProduct.toObject(), null, 2));

    // Verify with fresh read using .lean() to get plain object
    const verifiedProduct = await Product.findById(savedProduct._id).lean();
    console.log('Verified product FULL from DB:', JSON.stringify(verifiedProduct, null, 2));

    return res.status(201).json({ 
      message: "Product added successfully", 
      product: verifiedProduct
    });

  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({ 
      message: "Failed to add product", 
      error: error.message 
    });
  }
}