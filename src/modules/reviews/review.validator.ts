import { z } from "zod";

export const reviewValidator = z.object({
  userId: z.string().min(24, "User ID must be a valid ObjectId"),
  variantId: z.string().min(24, "Product ID must be a valid ObjectId"),
  rating: z.number().min(1).max(5, "Rating must be between 1 and 5"),
  comment: z.string().min(5, "Comment must be at least 5 characters long"),
});
