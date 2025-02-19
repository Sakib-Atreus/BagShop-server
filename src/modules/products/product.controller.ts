import { Request, Response } from "express";
import { ProductServices } from "./product.service";
import httpStatus from "http-status";
import { partialProductValidationSchema } from "./product.validator";
import catchAsync from "../../util/catchAsync";
import sendResponse from "../../util/sendResponse";
import { uploadMultipleImages } from "../../util/uploadImgToCloudynary";

// Create a product
const createProduct = catchAsync(async (req: Request, res: Response) => {
  const data = JSON.parse(req.body.data);
  const files = req.files as Express.Multer.File[];

  // console.log(req?.user)
  const productListId = req?.user!.productListId;
  const userId = req?.user!.id;
  const shopId = req?.user!.shopId;

  if (!data || !files || !productListId) {
    console.log(data, files, productListId);
    throw Error("!data || !files || !productListId is missing");
  }
  console.log(data, files, productListId);

  const result = await ProductServices.createProductIntoDB(
    userId,
    shopId,
    productListId,
    data,
    files
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "products adderd sccessfully",
    data: result,
  });
});

// Get all products
const getAllProducts = catchAsync(async (req, res) => {
  const query = req.query;

  const result = await ProductServices.getAllProductsFromDB(query);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "products rettried successfully",
    data: result,
  });
});

// Get a single product
const getSingleProduct = catchAsync(async (req: Request, res: Response) => {
  const { variantId } = req.params;
  const result = await ProductServices.getSingleProductFromDB(variantId);

  if (!result) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found!" });
  }

  // Rename productId to product in the response data
  const { productId, ...rest } = result.toObject(); // Convert to plain object
  const responseData = {
    ...rest,
    product: productId, // Rename productId to product
  };

  res.status(200).json({
    success: true,
    message: "Product fetched successfully!",
    data: responseData,
  });
});

// Delete a product
const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const { productId } = req.params;
  console.log("Deleting product with ID:", productId); // Add a debug log to check the ID

  const isExist = await ProductServices.getSingleProductFromDB(productId);

  if (!isExist) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found!" });
  }

  await ProductServices.deleteProductFromDB(productId);
  res
    .status(200)
    .json({ success: true, message: "Product deleted successfully!" });
});

// Update a product
const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const { productId } = req.params;
  const updateData = JSON.parse(req.body.data || "{}");
  const files = req.files as Express.Multer.File[];

  if (files && files.length > 0) {
    const filePaths = files.map((file) => file.path);
    const uploadedImages = await uploadMultipleImages(filePaths);
    updateData.images = uploadedImages;
  }

  const parsedProductData = partialProductValidationSchema.parse(updateData);

  const result = await ProductServices.updateProductFromDB(
    productId,
    parsedProductData
  );

  if (result) {
    res.status(200).json({
      success: true,
      message: "Product updated successfully!",
      data: {
        ...result.toObject(),
        totalQuantity: result.totalQuantity,
        totalSalesAmount: result.totalSalesAmount,
      },
    });
  } else {
    res.status(404).json({ success: false, message: "Product not found!" });
  }
});

// Export controllers
export const ProductControllers = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  deleteProduct,
  updateProduct,
};
