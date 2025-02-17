// routes/review.routes.ts
import express from "express";
import { ReviewController } from "./review.controller";

const router = express.Router();

// Route to add a review
router.post("/", ReviewController.addReview);

// Route to get reviews by product ID
router.get("/:productId", ReviewController.getReviews);

export const ReviewRoute = router;
