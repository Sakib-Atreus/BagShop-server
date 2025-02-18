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
import updateVariantQuantities from "../../util/updateVarientQuantity";

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
  payload: any,
  takeAllAvailable: boolean
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const fullName = payload.fisrtName + " " + payload.lastName;
    const convertedUserId = idConverter(userId);

    let cart = await CartModel.findOne({ userId: convertedUserId }).session(
      session
    );
    if (!cart || !convertedUserId) {
      throw new Error("Cart not found");
    }

    let cartData = cart.cart;
    if (!cartData) {
      throw new Error("No items in the cart");
    }

    // Update variant quantities and possibly the cart
    const variantUpdateResult = await updateVariantQuantities(
      cartData,
      session,
      takeAllAvailable,
      convertedUserId
    );

    // Check if variant updates have errors
    if (variantUpdateResult && "error" in variantUpdateResult) {
      throw new Error(`Error updating variants: ${variantUpdateResult.error}`);
    }

    // Find variants with insufficient stock
    const insufficientVariants = variantUpdateResult.filter(
      (variant) => variant.status === "insufficient"
    );

    if (insufficientVariants.length > 0) {
      return {
        status: "error",
        message:
          "Some variants have insufficient stock. Would you like to take all available?",
        insufficientVariants: insufficientVariants.map((variant) => ({
          _id: variant._id,
          productId: variant.productId,
          colorName: variant.colorName,
          colorHexCode: variant.colorHexCode,
          images: variant.images,
          requestedQuantity: variant.requestedQuantity,
          availableQuantity: variant.availableQuantity,
        })),
      };
    }

    // **Refetch the cart after updates**
    cart = await CartModel.findOne({ userId: convertedUserId }).session(
      session
    );
    if (!cart || !cart.cart) {
      throw new Error("Cart not found after updating variants");
    }
    cartData = cart.cart; // Use updated cart

    const { paymentMethod } = payload;

    const orderArray = generateOrderObjects(cartData, payload).filter(
      (order) => order.customerId !== null
    ) as Order[];

    if (paymentMethod === paymentMathod.On_Arrival) {
      const isDistributed = await OrderDistributor(
        orderArray,
        convertedUserId,
        session
      );

      if (isDistributed.status === "success") {
        await session.commitTransaction();
        session.endSession();
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
        const updatedOrderArray = orderArray.map((order) => {
          order.isPaid = true;
          return order;
        });

        const isDistributed = await OrderDistributor(
          updatedOrderArray,
          convertedUserId,
          session
        );

        if (isDistributed.status === "success") {
          await session.commitTransaction();
          session.endSession();
          return paymentIntent;
        } else {
          throw new Error("Payment successful but Order distribution failed");
        }
      }
    } else {
      throw new Error("No such payment method available");
    }
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const userServices = {
  createUser,
  createAshop,
  makeAnorder,
};

export default userServices;
