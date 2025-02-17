import { Schema, SchemaType, model } from "mongoose";
import { Product } from "./product.interface";

// Product Schema
const productSchema = new Schema<Product>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
    },
    shopId: {
      type: Schema.Types.ObjectId,
      ref: "ShopCollection",
      required: [true, "Shop ID is required"],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "UserCollection",
      required: [true, "User ID is required"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    previousPrice: {
      type: Number,
      required: [true, "Previous price is required"],
    },
    currentPrice: {
      type: Number,
      required: [true, "Current price is required"],
    },
    brand: {
      type: String,
      required: [true, "Brand is required"],
    },
    productCode: {
      type: String,
      required: [true, "Product code is required"],
    },
    designer: {
      type: String,
      required: [true, "Designers are required"],
    },
    bagType: {
      type: String,
      required: [true, "Bag type is required"],
    },
    variantId: [
      {
        type: Schema.Types.ObjectId,
        ref: "VariantCollection",
        default: null, // Set default value to null
      },
    ],
    deliveryCharge: {
      type: Number,
      default: 0,
    },
    sellsQuantity: {
      type: Number,
      default: 0,
      required: false,
    },
    // Add totalQuantity and totalSalesAmount to the schema
    totalQuantity: {
      type: Number,
      default: 0, // Default value if not set
    },
    totalSalesAmount: {
      type: Number,
      default: 0, // Default value if not set
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const ProductModel = model<Product>("Product", productSchema);
