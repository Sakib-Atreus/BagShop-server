import mongoose, { Schema } from "mongoose";
import {
  TCart,
  TEachOrder,
  TEachProductInCurt,
  TOrderList,
  TSellsList,
  TShippingLine,
  TShop,
  TUser,
  TWishList,
} from "./users.interface";
import bcrypt from "bcrypt";

// declear const for payment mathod check
export const paymentMethodEnum = {
  SSL: "SSL",
  On_Arrival: "On_Arrival",
} as const;

// each Cart product

const EachProductInCartSchema = new Schema<TEachProductInCurt>(
  {
    veriantId: { type: String, required: true },
    productImg: { type: String, required: true },
    productName: { type: String, required: true },
    productId: { type: String, required: true },
    productCode: { type: String, required: true },
    color: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true },
    delivaryCarge: { type: Number, required: true },
    shopId: { type: String, required: true },
    vendorTransactionNo: { type: String, required: true },
    shippingLineId: { type: String, required: true },
    sellsListId: { type: String, required: true },
    customerId: { type: String, required: true },
    customerOrderListId: { type: String, required: true },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

// Cart Schema
const CartSchema = new Schema<TCart>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "UserCollection",
    required: true,
  },
  grossTotalAmount: { type: Number, required: true, default: 0 },
  grossTotalDelivaryCharge: { type: Number, required: true, default: 0 },
  subTotal: { type: Number, required: true, default: 0 },
  cart: [{ type: EachProductInCartSchema, required: false, default: [] }],
});

const WishListSchema = new Schema<TWishList>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    wishList: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        currentPrice: { type: Number, required: true },
        description: { type: String, required: true },
      },
    ],
  },
  {
    versionKey: false,
  }
);

// Each Order Schema
const EachOrderSchema = new Schema<TEachOrder>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNo: { type: String, required: true },
    address: { type: String, required: true },
    townOrCity: { type: String, required: true },
    stateOrCountry: { type: String, required: true },
    postalCode: { type: String, required: true },

    // Only required if paymentMethod is "SSL"
    cardNumber: {
      type: String,
      required: function (this: any) {
        return this.paymentMethod === paymentMethodEnum.SSL;
      },
    },
    expirationDate: {
      type: Date,
      required: function (this: any) {
        return this.paymentMethod === paymentMethodEnum.SSL;
      },
    },
    securityCode: {
      type: String,
      required: function (this: any) {
        return this.paymentMethod === paymentMethodEnum.SSL;
      },
    },

    paymentMethod: {
      type: String,
      enum: Object.values(paymentMethodEnum),
      required: true,
    },

    variantId: { type: Schema.Types.ObjectId, ref: "Variant" },
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    shopId: { type: Schema.Types.ObjectId, ref: "Shop" },

    quantity: { type: Number, default: 1 },
    totalAmount: { type: Number, required: true },

    isPayed: { type: Boolean, default: false },
    isCanceled: { type: Boolean, default: false, required: true },

    canceledBy: {
      type: String,
      enum: ["Admin", "User", "Seller"],
      default: null,
    },
  },
  { timestamps: true }
);

// Order List Schema
const OrderListSchema = new Schema<TOrderList>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "UserCollection",
    required: true,
  },
  orderList: [
    { type: Schema.Types.ObjectId, ref: "OrderCollection", required: true },
  ], // holds rtef of order
});
// ........................................................

// .............................................................

//   selsList schema
const SellsListSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "UserCollection",
      required: true,
    },
    shopId: {
      type: Schema.Types.ObjectId,
      ref: "ShopCollection",
      required: true,
    },
    sellsList: [
      { type: Schema.Types.ObjectId, ref: "OrderListCollection", default: [] },
    ], //refer to order collection
  },
  { timestamps: true }
);

// shop schema
const ShopSchema = new Schema<TShop>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "UserCollection",
      required: true,
    },
    shopName: { type: String, required: true },
    bannerImg: { type: String, required: true },
    approvalStatus: {
      type: String,
      enum: ["approved", "pending", "denied"],
      default: "pending",
    },
    shopAddress: { type: String, required: true },
    shopDetail: { type: String, required: true },
    productListId: {
      type: Schema.Types.ObjectId,
      ref: "productListsCollections",
      default: null,
    },
    sellsListId: {
      type: Schema.Types.ObjectId,
      ref: "SellsListCollection",
      default: null,
    },
    shippingLineId: {
      type: Schema.Types.ObjectId,
      ref: "SellsListCollection",
      default: null,
    },
    transactionNumber: { type: String, required: true },
  },
  { timestamps: true }
);
// shipping line schema
const ShippingLineSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "Shop" },
    shopId: { type: Schema.Types.ObjectId, required: true, ref: "Shop" }, // Reference to Shop model
    shippingProductList: [
      { type: Schema.Types.ObjectId, required: true, ref: "Order" },
    ], // List of Order IDs
  },
  { timestamps: true }
);

// .....................................................

// ....................................................

// user collection
const UserSchema = new Schema<TUser>(
  {
    mobileNo: { type: String, required: false },
    name: { type: String, required: true },
    email: { type: String, required: false, unique: true },
    img: { type: String, required: false },
    role: {
      type: String,
      enum: ["admin", "customer", "seller"],
      default: "customer",
    },
    password: {
      type: String,
      required: true,
    },
    cartId: {
      type: Schema.Types.ObjectId,
      ref: "CartCollection",
      required: false,
      default: null,
    },
    wishListId: {
      type: Schema.Types.ObjectId,
      ref: "WishlistCollection",
      required: false,
      default: null,
    },
    orderListId: {
      type: Schema.Types.ObjectId,
      ref: "OrderListCollection",
      required: false,
      default: null,
    },
    shopId: {
      type: Schema.Types.ObjectId,
      ref: "ShopCollection",
      required: false,
      default: null,
    },
    productListId: {
      type: Schema.Types.ObjectId,
      ref: "ProductListCollection",
      required: false,
      default: null,
    },
    sellsListId: {
      type: Schema.Types.ObjectId,
      ref: "SellsListCollection",
      required: false,
      default: null,
    },
    shippingLineId: {
      type: Schema.Types.ObjectId,
      ref: "ShippingLineCollection",
      required: false,
      default: null,
    },
    isLoggedIn: { type: Boolean, default: false },
    loggedOutAt: { type: Date, required: false, default: null },
    isBlocked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

// .....................................................................

// Pre-save hook to hash the password before saving it to the database
UserSchema.pre<TUser>("save", async function (next) {
  // Validate that at least one of mobileNo or email is provided
  if (!this.mobileNo && !this.email) {
    return next(new Error("Either mobileNo or email must be provided."));
  }

  // If the password is modified, hash it before saving
  if (this.isModified("password")) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(this.password, salt);
      this.password = hashedPassword;
    } catch (error) {
      return next(error as Error);
    }
  }

  // Proceed with saving the document
  next();
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// ..................................................................

// Models

// customer collections
const CartModel = mongoose.model<TCart>("CartCollection", CartSchema);
const WishListModel = mongoose.model<TWishList>(
  "WishlistCollection",
  WishListSchema
);
const OrderListModel = mongoose.model<TOrderList>(
  "OrderListCollection",
  OrderListSchema
);

// seller collection models
const ShopModel = mongoose.model<TShop>("ShopCollection", ShopSchema);
const ShippingLineModel = mongoose.model<TShippingLine>(
  "ShippingLineCollection",
  ShippingLineSchema
);
const SellsListModel = mongoose.model<TSellsList>(
  "SellsListCollection",
  SellsListSchema
);

// Common models collection
const OrderModel = mongoose.model<TEachOrder>("EachOrder", EachOrderSchema);
const UserModel = mongoose.model<TUser>("UserCollection", UserSchema);

export default UserModel;
export {
  CartModel,
  WishListModel,
  OrderListModel,
  ShopModel,
  SellsListModel,
  OrderModel,
  ShippingLineModel,
};
