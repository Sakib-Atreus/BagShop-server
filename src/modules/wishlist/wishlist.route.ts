import express from "express";
import { WishlistController } from "./wishlist.controller";

const router = express.Router();

// Route to add a product to the wishlist
router.post("/", WishlistController.addProductToWishlist);

// Route to get the user's wishlist
router.get("/:userID", WishlistController.getWishlist);

export const WishlistRoute = router;
