import mongoose, { Schema, model, Types } from "mongoose";
import { IReview } from "./review.interface";

// Create the schema for the review
const reviewSchema = new Schema<IReview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "UserCollection",
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

// Create the Review model
const ReviewModel = model<IReview>("ReviewCollections", reviewSchema);

export { ReviewModel };