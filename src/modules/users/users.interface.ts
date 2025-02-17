import { Date, Types } from "mongoose";
import { TPaymentMathod, TUserRole } from "../../constent";

export type TShippingLine = {
  userId: Types.ObjectId;
  shopId: Types.ObjectId;
  shippingProductList: Types.ObjectId[]; // woll take order ids
};

export type TEachOrder = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNo: string;
  address: string;
  townOrCity: string;
  stateOrCountry: string;
  postalCode: string;
  cardNumber?: string;
  expirationDate?: Date;
  securityCode?: string;
  paymentMethod?: TPaymentMathod;
  variantId?: Types.ObjectId;
  productId?: Types.ObjectId;
  veriantId?: Types.ObjectId;
  shopId?: Types.ObjectId;
  quantity?: number;
  totalAmount?: number; //calculate it automatically
  isPayed?: boolean;
  isCanceled: boolean;
  canceledBy: TUserRole;
};

export type TEachProductInCurt = {
  veriantId: string;
  productImg: string;
  productName: string;
  productCode: string;
  color: string;
  price: number;
  quantity: number;
  totalPrice: number;
  delivaryCarge: number;
  shopId: string;
  vendorTransactionNo: string;
  shippingLineId: string;
  sellsListId: string;
  customerId: string;
  customerOrderListId: string;
};

export type TCart = {
  userId: Types.ObjectId;
  grossTotalAmount: number;
  grossTotalDelivaryCharge: number;
  subTotal: number;
  cart?: [TEachProductInCurt];
};

// Product interface for wishlist
export interface IProductDetails {
  productId: Types.ObjectId;
  name: string;
  currentPrice: number;
  description: string;
}

export type TWishList = {
  userId: Types.ObjectId;
  //   wishList: Types.ObjectId[];
  wishList: IProductDetails[];
};

export type TOrderList = {
  userId: Types.ObjectId;
  orderList: [Types.ObjectId]; //refer to order collection
};

export type TShop = Document & {
  userId: Types.ObjectId;
  shopName: string;
  bannerImg: string;
  approvalStatus: "approved" | "pending" | "denied";
  shopAddress: string;
  shopDetail: string;
  productListId?: Types.ObjectId;
  sellsListId?: Types.ObjectId;
  shippingLineId?: Types.ObjectId;
  transactionNumber: string;
};

export type TSellsList = {
  userId: Types.ObjectId;
  shopId: Types.ObjectId;
  sellsList: [Types.ObjectId];
};

export type TUser = {
  isModified?: any;
  name: string;
  mobileNo: string;
  email: string;
  password: string;
  img?: string;
  role?: TUserRole;
  cartId?: Types.ObjectId;
  wishListId?: Types.ObjectId;
  orderListId?: Types.ObjectId;
  shopId?: Types.ObjectId;
  productListId?: Types.ObjectId;
  shippingLineId?: Types.ObjectId;
  sellsListId?: Types.ObjectId;
  isLoggedIn?: boolean;
  loggedOutAt?: Date;
  isBlocked?: boolean;
  isDeleted: boolean;
};
