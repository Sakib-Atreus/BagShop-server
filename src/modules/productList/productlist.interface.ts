import { Types } from "mongoose";
import { Product } from "../products/product.interface";

export type TProductList = {
  shopId: Types.ObjectId;
  userId: Types.ObjectId;
  products?: Product[];
  variantId: [Types.ObjectId];
};
