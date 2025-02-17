import { Types } from "mongoose";

export interface IReview {
  userId: Types.ObjectId;
  variantId: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}
