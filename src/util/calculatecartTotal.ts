import mongoose from "mongoose"; // Make sure mongoose is imported for session management
import { CartModel } from "../modules/users/users.model";

import { Types } from "mongoose"; // Import Types from mongoose

export const calculateCartTotalsWithSession = async (
  userId: Types.ObjectId, // Change userId type to ObjectId
  session: mongoose.ClientSession
) => {
  try {
    const cart = await CartModel.findOne({ userId }).session(session); // userId is now ObjectId

    if (!cart || !cart.cart) {
      throw new Error("Cart or cart items not found for the given userId");
    }

    let grossTotalAmount = 0;
    let grossTotalDeliveryCharge = 0;
    let subTotal = 0;

    cart.cart.forEach((item) => {
      grossTotalAmount += item.totalPrice;
      subTotal += item.totalPrice;
      grossTotalDeliveryCharge += item.delivaryCarge || 0;
    });

    cart.grossTotalAmount = grossTotalAmount;
    cart.grossTotalDelivaryCharge = grossTotalDeliveryCharge;
    cart.subTotal = subTotal;

    await CartModel.updateOne(
      { _id: cart._id },
      {
        $set: {
          grossTotalAmount,
          grossTotalDeliveryCharge,
          subTotal,
        },
      },
      { session }
    );

    return {
      grossTotalAmount,
      grossTotalDeliveryCharge,
      subTotal,
    };
  } catch (error) {
    console.error("Error calculating cart totals:", error);
    throw error;
  }
};
