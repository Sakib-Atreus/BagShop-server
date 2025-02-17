import { z } from "zod";
import { Types } from "mongoose";

export const productListValidationSchema = z.object({
  shopID: z.instanceof(Types.ObjectId),
  userId: z.instanceof(Types.ObjectId),
});
