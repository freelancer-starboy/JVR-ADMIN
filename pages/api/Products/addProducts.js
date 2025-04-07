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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

 // Inside your POST handler
try {
    await connectDb();
    
    const [fields, files] = await new Promise((resolve, reject) => {
        const form = formidable({ multiples: true });
        form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            resolve([fields, files]);
        });
    });

    // Parse and validate basic fields
    const basicFields = {
        productName: String(fields.productName).trim(),
        productPrice: Number(fields.productPrice) || 0,
        productOldPrice: Number(fields.productOldPrice) || 0,
        productCategory: String(fields.productCategory).trim(),
        productType: String(fields.productType).trim(),
        productBrand: String(fields.productBrand).trim(),
        productDetails: JSON.parse(fields.productDetails || '[]')
    };

    // Validate required fields
    if (!basicFields.productName || !basicFields.productPrice || 
        !basicFields.productCategory || !basicFields.productType || 
        !basicFields.productBrand) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    // Parse variants
    let variantsData;
    try {
        variantsData = JSON.parse(fields.productVariants || '[]');
    } catch (error) {
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

        return {
            color: String(variant.color).trim(),
            sizes: variant.sizes.map(size => ({
                size: String(size.size).trim(),
                stock: Number(size.stock) || 0
            })),
            images: uploadedUrls
        };
    }));

    // Create product with validated data
    const productData = {
        ...basicFields,
        productVariants: processedVariants
    };

    const newProduct = new Product(productData);
    const savedProduct = await newProduct.save();

    const fullProduct = await Product.findById(savedProduct._id);

    return res.status(201).json({ 
        message: "Product added successfully", 
        product: fullProduct 
    });

} catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ 
        message: "Failed to add product", 
        error: error.message 
    });
}
}