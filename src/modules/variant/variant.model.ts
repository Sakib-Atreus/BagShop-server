import mongoose, { Schema, Document } from "mongoose";
import { Types } from "mongoose";
import { Tvariant } from "./variant.interface"; // Import the Tvariant type

const variantSchema = new Schema<Tvariant>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    colorName: { type: String, required: true },
    colorHexCode: { type: String, required: true },
    quantity: { type: Number, required: true },
    images: { type: [String], required: true, default: null },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

const VariantModel = mongoose.model<Tvariant>(
  "VariantCollection",
  variantSchema
);

export default VariantModel;
