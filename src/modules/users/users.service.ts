import mongoose from "mongoose";
import { TUser } from "./users.interface";
import UserModel, {
  CartModel,
  OrderListModel,
  ShopModel,
  WishListModel,
} from "./users.model";
import idConverter from "../../util/idConvirter";
import { paymentMathod } from "../../constent";
import { generateOrderObjects } from "../../util/orderObjConstructer";
import { paymentService } from "../../services/PaymentServices";
import { Order, OrderDistributor } from "../../util/orderDistubuter";

const createUser = async (userData: TUser) => {
  const session = await mongoose.startSession();
  session.startTransaction(); // Start transaction

  try {
    // Step 1: Create the new user inside the transaction
    const newUser = new UserModel(userData);
    const savedUser = await newUser.save({ session });

    // Step 2: Create related collections
    const newCart = new CartModel({ userId: savedUser._id });
    const savedCart = await newCart.save({ session });

    const newWishList = new WishListModel({
      userId: savedUser._id,
      wishList: [],
    });
    const savedWishList = await newWishList.save({ session });

    const newOrderList = new OrderListModel({
      userId: savedUser._id,
      orderList: [],
    });
    const savedOrderList = await newOrderList.save({ session });

    // Step 3: Update user with the newly created collection IDs
    const updatedUser = await UserModel.findByIdAndUpdate(
      savedUser._id,
      {
        cartId: savedCart._id,
        wishListId: savedWishList._id,
        orderListId: savedOrderList._id,
      },
      { new: true, session }
    );

    // Step 4: Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return {
      user: updatedUser,
      cart: savedCart,
      wishList: savedWishList,
      orderList: savedOrderList,
    };
  } catch (error: any) {
    // Rollback on error
    await session.abortTransaction();
    session.endSession();
    throw new Error(`Transaction failed: ${error.message}`);
  }
};

const createAshop = async (userId: any, payload: any) => {
  const shopPayload = { ...payload, userId: userId };
  const result = await ShopModel.create(shopPayload);

  return result;
};

const makeAnorder: any = async (
  userId: string,
  orderListId: string,
  payload: any
) => {
  const fullName = payload.fisrtName + " " + payload.lastName; // Keeping typo as per your request

  const convertedUserId = idConverter(userId);
  const cart = await CartModel.findOne({ userId: convertedUserId });
  if (!cart || !convertedUserId) {
    throw new Error("Cart not found");
  }

  const cartData = cart.cart;
  if (!cartData) {
    throw new Error("No items in the cart");
  }

  const { paymentMethod } = payload;

  const orderArray = generateOrderObjects(cartData, payload).filter(
    (order) => order.customerId !== null
  ) as Order[];

  if (paymentMethod === paymentMathod.On_Arrival) {
    console.log("I am being called");
    const isDistributed = await OrderDistributor(orderArray, convertedUserId);

    if (isDistributed.status === "success") {
      return { message: "ok" };
    } else {
      throw new Error("Order distribution failed");
    }
  } else if (paymentMethod === paymentMathod.SSL) {
    const paymentIntent = await paymentService.pay(
      cart.subTotal,
      payload.paymentMethodId,
      fullName,
      payload.email,
      payload.phone,
      payload.address
    );

    if (paymentIntent.status === "succeeded") {
      // ...................................................
      const updatedOrderArray = orderArray.map((order) => {
        order.isPaid = true; // Mark as paid
        return order;
      });
      const isDistributed = await OrderDistributor(
        updatedOrderArray,
        convertedUserId
      );

      if (isDistributed.status === "success") {
        return paymentIntent;
      } else {
        throw new Error("payment successfull but Order distribution failed");
      }
      //.....................................................
    }
  } else {
    throw new Error("No such payment method available");
  }
};

const userServices = {
  createUser,
  createAshop,
  makeAnorder,
};

export default userServices;
