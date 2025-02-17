import { Request, Response } from "express";
import { WishlistService } from "./wishlist.service";
import catchAsync from "../../util/catchAsync";
import sendResponse from "../../util/sendResponse";
import { Types } from "mongoose";
import { addProductToWishlistSchema } from "./wishlist.validator";

// Controller for adding a product to the wishlist
const addProductToWishlist = catchAsync(async (req: Request, res: Response) => {
  const parsedData = addProductToWishlistSchema.parse(req.body);

  const { userID, productID } = parsedData;

  const userObjectId = new Types.ObjectId(userID); // Convert string to ObjectId
  const productObjectId = new Types.ObjectId(productID); // Convert string to ObjectId

  // Add product to the wishlist using the service
  const result = await WishlistService.addProductToWishlist(
    userObjectId,
    productObjectId
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product added to wishlist successfully!",
    data: result,
  });
});

// Controller for fetching the user's wishlist
const getWishlist = catchAsync(async (req: Request, res: Response) => {
  const { userID } = req.params;
  const userObjectId = new Types.ObjectId(userID);

  // Fetch wishlist for the user using the service
  const result = await WishlistService.getWishlist(userObjectId);

  if (!result || result.wishList.length < 1) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "No products found in wishlist!",
      data: [],
    });
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Wishlist fetched successfully!",
    data: result.wishList,
  });
});

export const WishlistController = {
  addProductToWishlist,
  getWishlist,
};
