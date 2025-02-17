import { Product } from "../products/product.interface";
import { TShop } from "../users/users.interface";
import { ProductListModel } from "./productlist.model";

// Add a product to a specific shop
const addProductToShop = async (shopID: string, product: Product) => {
  const shop = await ProductListModel.findOne({ shopID });
  if (!shop) {
    return await ProductListModel.create({ shopID, products: [product] });
  }

  // Ensure `products` is always an array
  if (!shop.products) {
    shop.products = [];
  }

  shop.products.push(product);
  return await shop.save();
};

// Get all products under a shopID
const getProductsByShopID = async (shopID: string) => {
  const productList = await ProductListModel.findOne({ shopID });

  if (!productList) return null;

  return productList.products;
};

export const ProductListService = {
  addProductToShop,
  getProductsByShopID,
};
