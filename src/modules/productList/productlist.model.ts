import { Schema, model } from "mongoose";
import { Product } from "../products/product.interface";
import { TProductList } from "./productlist.interface";

// Product Schema
const productSchema = new Schema<Product>(
  {
    name: { type: String, required: true },
    shopId: { type: Schema.Types.ObjectId },
    userId: { type: Schema.Types.ObjectId },
    description: { type: String, required: true },
    previousPrice: { type: Number, required: true },
    currentPrice: { type: Number, required: true },
    brand: { type: String, required: true },
    productCode: { type: String, required: true },
    designer: { type: String, required: true },
    bagType: { type: String, required: true },
    variantId: {
      type: [Schema.Types.ObjectId],
      required: [true, "Variants are required"],
    },
    totalQuantity: { type: Number, required: true },
    sellsQuantity: { type: Number, required: true },
  },
  { _id: false }
);

// ProductList Schema
const productListSchema = new Schema<TProductList>(
  {
    shopId: { type: Schema.Types.ObjectId, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, required: true, unique: true },
    products: { type: [productSchema], required: false, default: [] },
  },
  { timestamps: true, versionKey: false }
);

export const ProductListModel = model(
  "productListsCollections",
  productListSchema
);
