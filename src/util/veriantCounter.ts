import { ClientSession, Types } from "mongoose";
import VariantModel from "../modules/variant/variant.model";
import { ProductModel } from "../modules/products/product.model";


const verientCounter = async (productId: Types.ObjectId, session?: ClientSession) => {
    try {
        // Find all variants linked to the product
        const variants = await VariantModel.find({ productId }).select("quantity").session(session || null);

        if (!variants.length) {
            console.log("No variants found for the product.");
            return;
        }

        // Calculate the total quantity
        const totalQuantity = variants.reduce((sum, variant) => sum + (variant.quantity || 0), 0);

        // Update the totalQuantity field in the product
        await ProductModel.updateOne(
            { _id: productId },
            { $set: { totalQuantity } },
            { session }
        );

        console.log(`Total quantity updated to: ${totalQuantity}`);
    } catch (error) {
        console.error("Error updating total quantity:", error);
    }
};

export default verientCounter;