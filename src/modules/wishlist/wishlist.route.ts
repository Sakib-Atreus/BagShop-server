import express from "express";
import { WishlistController } from "./wishlist.controller";

const router = express.Router();

// Route to add a product to the wishlist
router.post("/", WishlistController.addProductToWishlist);

// Route to get the user's wishlist
router.get("/:userID", WishlistController.getWishlist);

// Route to remove a product from the wishlist
router.delete(
  "/:userID/:productID",
  WishlistController.removeProductFromWishlist
);

export const WishlistRoute = router;
