import { WishListModel } from "../users/users.model"; // Correct import path for your model
import { ProductModel } from "../products/product.model"; // Correct import path for your model
import { Types } from "mongoose";

// Fetch wishlist by userID and populate the products
const getWishlist = async (userID: Types.ObjectId) => {
  const wishlist = await WishListModel.findOne({ userId: userID }).populate(
    "wishList.productId"
  );

  if (!wishlist || wishlist.wishList.length < 1) {
    throw new Error("Wishlist not found or is empty");
  }

  return wishlist;
};

// Add product to the wishlist
const addProductToWishlist = async (
  userID: Types.ObjectId,
  productID: Types.ObjectId
) => {
  // Check if the product exists and fetch details
  const product = await ProductModel.findById(productID);
  if (!product) {
    throw new Error("Product not found");
  }

  // Find the user's wishlist
  let wishlist = await WishListModel.findOne({ userId: userID });

  if (!wishlist) {
    // If no wishlist exists, create a new one
    wishlist = new WishListModel({ userId: userID, wishList: [] });
  }

  // Check if the product is already in the wishlist
  const productExists = wishlist.wishList.some(
    (item) => item.productId.toString() === productID.toString()
  );

  if (productExists) {
    throw new Error("Product already in wishlist");
  }

  // Add product details to the wishlist
  const productDetails = {
    productId: productID,
    name: product.name,
    currentPrice: product.currentPrice,
    description: product.description,
  };

  wishlist.wishList.push(productDetails);
  await wishlist.save();

  // Populate product details in the wishlist
  const populatedWishlist = await WishListModel.findById(wishlist._id).populate(
    "wishList.productId"
  );

  return populatedWishlist;
};

export const WishlistService = {
  addProductToWishlist,
  getWishlist,
};
