// controllers/review.controller.ts
import { Request, Response } from "express";
import { ReviewService } from "./review.service";
import { reviewValidator } from "./review.validator";
import sendResponse from "../../util/sendResponse";
import { Types } from "mongoose";
import catchAsync from "../../util/catchAsync";

// Add a review
const addReview = catchAsync(async (req: Request, res: Response) => {
  const { userId, productId, rating, comment } = req.body;

  // Validate the data using Zod
  reviewValidator.parse({
    userId,
    productId,
    rating,
    comment,
  });

  const userObjectId = new Types.ObjectId(userId);
  const productObjectId = new Types.ObjectId(productId);

  // Call the service to add the review
  const newReview = await ReviewService.addReview(userObjectId, productObjectId, rating, comment);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Review added successfully!",
    data: newReview,
  });
});

// Get all reviews for a product
const getReviews = catchAsync(async (req: Request, res: Response) => {
  const { productId } = req.params;
  const productObjectId = new Types.ObjectId(productId);

  const reviews = await ReviewService.getReviewsByProductId(productObjectId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Reviews fetched successfully!",
    data: reviews,
  });
});

export const ReviewController = {
  addReview,
  getReviews,
};