import { z } from "zod";

// Define the validation schema for each variant
const variantValidationSchema = z.object({
  colorName: z
    .string()
    .min(3, { message: "Color name must be at least 3 characters." })
    .max(30, { message: "Color name must be at most 30 characters long." }),
  colorHexCode: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, {
    message: "Invalid hex color code.",
  }),
  quantity: z
    .number()
    .min(0, { message: "Quantity cannot be less than 0." })
    .max(9999, { message: "Quantity cannot be more than 9999." })
    .nonnegative({ message: "Quantity must be a non-negative number." }),
  images: z
    .array(
      z
        .string()
        .url({ message: "Each image must be a valid URL." })
        .min(1, { message: "At least one image is required." })
    )
    .nonempty({ message: "Images cannot be empty." })
    .max(5, { message: "No more than 5 images are allowed." }), // Adjust the number of images if necessary
});

// Validation schema for product model
const productValidationSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Product name must be at least 3 characters." })
    .max(100, { message: "Product name must be at most 100 characters long." }),
  shopID: z.string().min(1, { message: "Shop ID is required." }),
  userID: z.string().min(1, { message: "User ID is required." }),
  description: z
    .string()
    .min(10, { message: "Product description must be at least 10 characters." })
    .max(1000, {
      message: "Product description must be at most 1000 characters long.",
    }),
  previousPrice: z
    .number()
    .min(0, { message: "Previous price cannot be negative." }),
  currentPrice: z
    .number()
    .min(0, { message: "Current price cannot be negative." }),
  brand: z
    .string()
    .min(2, { message: "Brand name must be at least 2 characters long." }),
  productCode: z.string().min(1, { message: "Product code is required." }),
  designer: z.string(),
  bagType: z.string(),
  variant: variantValidationSchema,
  totalQuantity: z
    .number()
    .min(0, { message: "Total quantity cannot be negative." }),
  sellsQuantity: z
    .number()
    .min(0, { message: "Sells quantity cannot be negative." }),
});

// Making the entire product schema optional for partial updates
const partialProductValidationSchema = productValidationSchema.partial();

export { productValidationSchema, partialProductValidationSchema };
