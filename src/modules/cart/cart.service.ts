import mongoose, { Types } from "mongoose";
import { CartModel } from "../users/users.model";
import idConverter from "../../util/idConvirter";
import VariantModel from "../variant/variant.model";
import { Product } from "../products/product.interface";
import { TShop } from "../users/users.interface";
import { calculateCartTotalsWithSession } from "../../util/calculatecartTotal";

const addToCart = async (
  userId: string,
  orderListId: string,
  veriantId: string,
  quantity: number
) => {
  const session = await mongoose.startSession(); // Start the session
  session.startTransaction(); // Begin transaction

  try {
    const userIdConverted = idConverter(userId);
    const veriantIdConverted = idConverter(veriantId);
    if (!userIdConverted) {
      throw Error("user id is not cvonverted");
    }

    const findProduct = await VariantModel.findById(veriantIdConverted)
      .populate({
        path: "productId",
        populate: {
          path: "shopId", // Populating shopId inside productId
        },
      })
      .session(session); // Use the session

    if (!findProduct) {
      throw new Error("Product is not found");
    }

    console.log(findProduct);

    if (!findProduct.productId || typeof findProduct.productId === "string") {
      throw new Error("Product details could not be populated");
    }

    const product = findProduct.productId as Product;

    const shop =
      product.shopId && typeof product.shopId !== "string"
        ? (product.shopId as TShop)
        : null;

    const contucConstractItemInCart = {
      veriantId: veriantId,
      productImg: findProduct.images[0] || null,
      productName: product.name,
      productCode: product.productCode,
      productId: findProduct.productId,

      color: findProduct.colorName,
      price: product.currentPrice,
      quantity: quantity,
      totalPrice: product.currentPrice * quantity,
      delivaryCarge: product.deliveryCharge,

      shopId: product.shopId
        ? // @ts-ignore
          product.shopId instanceof Types.ObjectId
          ? product.shopId.toString()
          : product.shopId._id.toHexString()
        : null,
      vendorTransactionNo: shop?.transactionNumber,
      shippingLineId: shop?.shippingLineId?.toHexString(),
      sellsListId: shop?.sellsListId?.toHexString(),
      customerId: userId,
      customerOrderListId: orderListId,
    };

    console.log(contucConstractItemInCart);

    const addItemInCart = await CartModel.findOneAndUpdate(
      { userId: userIdConverted }, // Find the user's cart
      { $push: { cart: contucConstractItemInCart } }, // Add the new item to the cart
      { new: true, upsert: true, session } // Use the session and upsert if necessary
    );
    await calculateCartTotalsWithSession(userIdConverted, session); // Recalculate cart totals

    await session.commitTransaction(); // Commit the transaction
    return addItemInCart;
  } catch (error) {
    console.error("Error adding item to cart:", error);
    await session.abortTransaction(); // Abort the transaction in case of error
    throw error;
  } finally {
    session.endSession(); // End the session
  }
};

const getAllCartsFromDB = async (id: string) => {
  const result = await CartModel.find({ _id: id });
  return result;
};

const getSingleCartFromDB = async (_id: string) => {
  const result = await CartModel.findOne({ _id });
  return result;
};

const getCart = async (userId: string) => {
  const result = await CartModel.findOne({ userId: idConverter(userId) });
  return result;
};

const deleteCartFromDB = async (_id: string) => {
  const result = await CartModel.deleteOne({ _id });
  return result;
};

// Update a cart by ID
const updateCartFromDB = async (
  _id: string,
  updateData: Partial<{ userId: Types.ObjectId; cart: Types.ObjectId[] }>
) => {
  try {
    const result = await CartModel.findByIdAndUpdate(_id, updateData, {
      new: true,
      runValidators: true,
    }).exec();
    return result;
  } catch (error) {
    console.error(`Failed to update cart with id ${_id}:`, error);
    throw error;
  }
};

// Export services
export const CartServices = {
  addToCart,
  getAllCartsFromDB,
  getCart,
  getSingleCartFromDB,
  deleteCartFromDB,
  updateCartFromDB,
};
