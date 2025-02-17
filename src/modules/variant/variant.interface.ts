import { Types } from "mongoose";
import { Product } from "../products/product.interface";

export type Tvariant = {
  productId: Types.ObjectId | Product;
  colorName: string;
  colorHexCode: string;
  quantity: number;
  images: string[];
};
