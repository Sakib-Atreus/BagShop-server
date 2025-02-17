import { z } from "zod";

// Validator for adding a product to the wishlist
export const addProductToWishlistSchema = z.object({
  userID: z.string().min(1, "User ID is required"),
  productID: z.string().min(1, "Product ID is required"),
});
