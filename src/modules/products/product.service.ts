import mongoose from "mongoose";
import QueryBuilder from "../../builder/QueryBuilder";
import { productSearchAbleField } from "../../constent";
import { uploadMultipleImages } from "../../util/uploadImgToCloudynary";
import VariantModel from "../variant/variant.model";
import { Product } from "./product.interface";
import { ProductListModel } from "../productList/productlist.model";
import idConverter from "../../util/idConvirter";
import { ProductModel } from "./product.model";

// Create a new product
const createProductIntoDB = async (
  userId: string,
  shopId: string,
  productListId: string,
  data: any,
  files: any
) => {
  const session = await mongoose.startSession();
  session.startTransaction(); // Start the transaction

  try {
    const productListIdConverted = idConverter(productListId);
    const userIdConverted = idConverter(userId);
    const shopIdConverted = idConverter(shopId);

    const { variant, ...productData } = data;

    // Add shopId and userId to productData
    const updatedProductData = {
      ...productData,
      shopId: shopIdConverted,
      userId: userIdConverted,
    };

    // console.log("product data",updatedProductData)

    // Create the product within the session
    const productResult = await ProductModel.create([updatedProductData], {
      session,
    });

    if (!productResult || productResult.length === 0) {
      throw new Error("Product creation failed");
    }

    const createdProduct = productResult[0];

    // Push the new product into the products array of the product list
    const productListResult = await ProductListModel.findByIdAndUpdate(
      productListIdConverted,
      { $push: { products: createdProduct._id } }, // Pushing the new product ID
      { new: true, session }
    );

    if (!productListResult) {
      throw new Error("ProductList not found");
    }

    const { colorName, colorHexCode, quantity } = variant;

    // Upload images
    const filePaths = files.map((file: any) => file.path);
    const images = await uploadMultipleImages(filePaths);

    // Create the variant object
    const variantObject = {
      productId: createdProduct._id,
      colorName,
      colorHexCode,
      quantity,
      images,
    };

    // Create the variant within the session
    const VariantResult = await VariantModel.create([variantObject], {
      session,
    });

    if (!VariantResult || VariantResult.length === 0) {
      throw new Error("Variant creation failed");
    }

    // Update the product with the variantID
    const updateResult = await ProductModel.updateOne(
      { _id: createdProduct._id },
      { $push: { variantId: VariantResult[0]._id } },
      { session }
    );

    if (updateResult.matchedCount === 0) {
      throw new Error("Product not found, update failed.");
    }

    // Commit the transaction after all the operations succeed
    await session.commitTransaction();
  } catch (error) {
    console.error("Error during transaction:", error);

    // If something goes wrong, abort the transaction
    await session.abortTransaction();
    throw new Error(
      "Failed to create product and variant, transaction rolled back."
    );
  } finally {
    session.endSession(); // Always end the session
  }
};

// Get all products and search by criteria
const getAllProductsFromDB = async (query: Record<string, unknown>) => {
  // console.log("query",query)

  if (query.colorName || query.colorHexCode) {
    console.log("here", query);
    const result = await VariantModel.find({
      $or: [
        { colorName: query.colorName },
        { colorHexCode: query.colorHexCode },
      ],
    }).populate("productId");
    return result;
  } else {
    const productQuery = new QueryBuilder(
      ProductModel.find().populate("variantId"),
      query
    )
      .search(productSearchAbleField)
      .filter()
      .mostPopularProducts()
      .productWithPriceRange()
      .checkInStock()
      .sort()
      .paginate()
      .fields();
    const result = await productQuery.modelQuery;
    // const meta = await productQuery.countTotal();
    return result;
  }
};

// Get a single product by ID
const getSingleProductFromDB = async (_id: string) => {
  const result = await ProductModel.findOne({ _id });
  return result;
};

// Delete a product by ID
const deleteProductFromDB = async (_id: string) => {
  const result = await ProductModel.deleteOne({ _id });
  return result;
};

// Update a product by ID
const updateProductFromDB = async (
  _id: string,
  updateData: Partial<Product>
) => {
  try {
    const result = await ProductModel.findByIdAndUpdate(
      _id,
      updateData as Product,
      {
        new: true,
        runValidators: true,
      }
    ).exec();
    return result;
  } catch (error) {
    console.error(`Failed to update product with id ${_id}:`, error);
    throw error;
  }
};

// Export services
export const ProductServices = {
  createProductIntoDB,
  getAllProductsFromDB,
  getSingleProductFromDB,
  deleteProductFromDB,
  updateProductFromDB,
};
