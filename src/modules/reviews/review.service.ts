// services/review.service.ts
import { ReviewModel } from "./review.model";
import { Types } from "mongoose";

// Add a review to the product
const addReview = async (userId: Types.ObjectId, productId: Types.ObjectId, rating: number, comment: string) => {
  // Create a new review
  const newReview = new ReviewModel({
    userId,
    productId,
    rating,
    comment,
  });

  // Save the review to the database
  await newReview.save();

  return newReview;
};

// Fetch all reviews for a product
const getReviewsByProductId = async (productId: Types.ObjectId) => {
  const reviews = await ReviewModel.find({ productId }).populate("userId", "email");
  return reviews;
};

export const ReviewService = {
  addReview,
  getReviewsByProductId,
};