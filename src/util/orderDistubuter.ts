import mongoose, { ClientSession, Types } from "mongoose";
import { CartModel, OrderListModel, OrderModel, SellsListModel, ShippingLineModel } from "../modules/users/users.model";

// Define the TypeScript interface for an order object
export interface Order {
  customerId: Types.ObjectId;
  sellsListId: Types.ObjectId;
  shippingLineId: Types.ObjectId;
  [key: string]: any; // Allow additional properties dynamically
}


export const OrderDistributor = async (
  orders: Order[],
  userId: Types.ObjectId,
  existingSession?: ClientSession
): Promise<Record<string, any>> => {
  
  const session = existingSession || await mongoose.startSession();
  let isNewSession = !existingSession;

  if (isNewSession) {
    session.startTransaction();
  }

  try {
    // If orders are not passed, return an error
    if (!orders || orders.length === 0) {
      throw new Error("No orders to distribute");
    }

    const createdOrders = existingSession
      ? orders // If session exists, assume orders are already created
      : await OrderModel.insertMany(orders, { session });

    if (!createdOrders) {
      throw new Error("Couldn't create orders");
    }

    const orderIds: Types.ObjectId[] = createdOrders.map(order => order._id as Types.ObjectId);

    for (let i = 0; i < orders.length; i++) {
      const { sellsListId, shippingLineId, customerId } = orders[i];
      const orderId = orderIds[i];

      await SellsListModel.findByIdAndUpdate(
        sellsListId,
        { $push: { sellsList: orderId } },
        { session }
      );

      await ShippingLineModel.findByIdAndUpdate(
        shippingLineId,
        { $push: { shippingProductList: orderId } },
        { session }
      );

      await OrderListModel.findOneAndUpdate(
        { userId: customerId },
        { $push: { orderList: orderId } },
        { session, upsert: true, new: true }
      );
    }

    await CartModel.findOneAndUpdate(
      { userId: userId },
      { $set: { cart: [] } }, // Empty the cart array
      { session }
    );

    if (isNewSession) {
      await session.commitTransaction();
      session.endSession();
    }

    return { status: "success" };
  } catch (error: any) {
    if (isNewSession) {
      await session.abortTransaction();
      session.endSession();
    }
    throw new Error(`Failed to distribute orders: ${error.message}`);
  }
};
