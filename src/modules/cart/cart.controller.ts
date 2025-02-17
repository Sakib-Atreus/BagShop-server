import httpStatus from "http-status";
import { Request, Response } from "express";
import { CartServices } from "./cart.service";
import catchAsync from "../../util/catchAsync";
import sendResponse from "../../util/sendResponse";

// Create a cart
const addToCart = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  const orderListId = req.user?.orderListId;

  const variantId = req.query?.variantId as string; // Explicitly cast to string
  const quantity = Number(req.query?.quantity); // Convert to number

  console.log(req.user);

  if (!userId || !variantId || !quantity || !orderListId || isNaN(quantity)) {
    throw new Error("userId, variantId, or quantity is missing or invalid");
  }

  const result = await CartServices.addToCart(
    userId,
    orderListId,
    variantId,
    quantity
  );

  res.json(result);
});

// Get all carts
const getAllCarts = catchAsync(async (req: Request, res: Response) => {
  const query = String(req.query);
  const result = await CartServices.getAllCartsFromDB(query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Carts retrieved successfully",
    data: result,
  });
});

// Get a user cart
const getCart = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  console.log(req.user);
  const result = await CartServices.getCart(userId);

  if (!result) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.NOT_FOUND,
      message: "Cart not found!",
      data: null,
    });
  }

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Cart retrieved successfully",
    data: result,
  });
});

// Get a single cart
const getSingleCart = catchAsync(async (req: Request, res: Response) => {
  const { cartId } = req.params;
  const result = await CartServices.getSingleCartFromDB(cartId);

  if (!result) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.NOT_FOUND,
      message: "Cart not found!",
      data: null,
    });
  }

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Cart retrieved successfully",
    data: result,
  });
});

// Delete a cart
const deleteCart = catchAsync(async (req: Request, res: Response) => {
  const { cartId } = req.params; // Get the cart ID from the params
  const isExist = await CartServices.getSingleCartFromDB(cartId); // Check if the cart exists

  if (!isExist) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.NOT_FOUND,
      message: "Cart not found!",
      data: null,
    });
  }

  await CartServices.deleteCartFromDB(cartId); // Call the service to delete the cart

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Cart deleted successfully!",
    data: null,
  });
});

// Update a cart
const updateCart = catchAsync(async (req: Request, res: Response) => {
  const { cartId } = req.params; // Get the cart ID from the params
  const updateData = req.body; // Data to update the cart with
  const result = await CartServices.updateCartFromDB(cartId, updateData); // Call the service to update the cart

  if (!result) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.NOT_FOUND,
      message: "Cart not found!",
      data: null,
    });
  }

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Cart updated successfully!",
    data: result,
  });
});

// Export controllers
export const CartControllers = {
  addToCart,
  getCart,
  getAllCarts,
  getSingleCart,
  deleteCart,
  updateCart,
};
