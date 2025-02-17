import mongoose from "mongoose";
import idConverter from "../../util/idConvirter";
import { ProductModel } from "../products/product.model";
import VariantModel from "./variant.model";

const createVariantIntoDB = async (
  productData: any,
  productId: string,
  userId: string
) => {
  const session = await mongoose.startSession();
  session.startTransaction(); // Start the transaction

  try {
    const productIdConverted = idConverter(productId);
    const userIdConverted = idConverter(userId);

    if (!userIdConverted) {
      throw new Error("Invalid User ID");
    }

    // Find the product by ID and check user authorization
    const findProduct = await ProductModel.findById(productIdConverted).session(
      session
    );

    if (!findProduct) {
      throw new Error("Product not found");
    }

    if (!findProduct.userId) {
      throw new Error("Product does not have a userId");
    }

    if (findProduct.userId.toString() !== userIdConverted.toString()) {
      throw new Error("Not authorized to add variant to this product.");
    }

    // Prepare the variant data
    const variantData = {
      productId: productIdConverted,
      ...productData,
    };

    // Create the variant in the database
    const createVariant = await VariantModel.create([variantData], { session });

    if (!createVariant || createVariant.length === 0) {
      throw new Error("Variant creation failed");
    }

    // Add the new variant ID to the product's variantID array
    await ProductModel.findByIdAndUpdate(
      productIdConverted,
      { $push: { variantID: createVariant[0]._id } },
      { session }
    );

    // Commit the transaction after all operations succeed
    await session.commitTransaction();
    session.endSession(); // End the session

    return createVariant[0]; // Return the created variant
  } catch (error) {
    console.error("Error during transaction:", error);

    // If something goes wrong, abort the transaction
    await session.abortTransaction();
    session.endSession(); // End the session

    throw new Error("Failed to create variant, transaction rolled back.");
  }
};

// Export services
export const variantServices = {
  createVariantIntoDB,
};
