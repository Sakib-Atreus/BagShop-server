import { Request, Response } from "express";
import { ProductListService } from "./productlist.service";
import catchAsync from "../../util/catchAsync";

// Add a product to a shop
const addProductToShop = catchAsync(async (req, res) => {
  const { shopID } = req.params;
  const productData = req.body;
  const result = await ProductListService.addProductToShop(shopID, productData);

  res.status(201).json({
    success: true,
    message: "Product added successfully!",
    data: result,
  });
});

// Get all products under a shopID
const getProductsByShopID = catchAsync(async (req, res) => {
  const { shopID } = req.params;

  const result = await ProductListService.getProductsByShopID(shopID);

  if (!result || result.length === 0) {
    return res
      .status(404)
      .json({ success: false, message: "No products found for this shop!" });
  }

  res.status(200).json({
    success: true,
    message: "Products fetched successfully!",
    data: result,
  });
});

export const ProductListController = {
  addProductToShop,
  getProductsByShopID,
};
