import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import authUtil from "./auth.util";

import config from "../../config";
import UserModel from "../users/users.model";
import { userRole } from "../../constent";

const logIn = async (email: string, password: string) => {
  const findUserWithEmail = await UserModel.findOne({
    email: email,
    isDeleted: false,
  }).select("+password");

  if (!findUserWithEmail) {
    throw Error("no user found with this email");
  }

  const match = await bcrypt.compare(password, findUserWithEmail.password);
  if (!match) {
    throw Error("password is not matched");
  }

  const findUserAndUpdate = await UserModel.findOneAndUpdate(
    { email: email },
    { isLoggedIn: true },
    { new: true }
  );

  if (!findUserWithEmail) {
    throw Error("no; user found with this email");
  }

  // console.log(findUserWithEmail._id.toHexString(), findUserWithEmail.role);

  // Tokenize user data
  let tokenizeData = {
    id: findUserWithEmail._id.toHexString(),
    cartId: findUserWithEmail.cartId?.toHexString() || undefined,
    wishListId: findUserWithEmail.wishListId?.toHexString() || undefined,
    orderListId: findUserWithEmail.orderListId?.toHexString() || undefined,
    shopId: findUserWithEmail.shopId?.toHexString() || undefined,
    productListId: findUserWithEmail.productListId?.toHexString() || undefined,
    sellsListId: findUserWithEmail.sellsListId?.toHexString() || undefined,
    role: findUserWithEmail.role,
  };

  const approvalToken = authUtil.createToken(tokenizeData);
  const refreshToken = authUtil.createToken(tokenizeData);

  // console.log(approvalToken, refreshToken, findUserWithEmail)

  return { approvalToken, refreshToken, findUserAndUpdate };
};

const logOut = async (authorizationToken: string) => {
  const decoded = authUtil.decodeAuthorizationToken(authorizationToken);
  const { id } = decoded as JwtPayload;

  console.log(id);

  const findUserById = await UserModel.findByIdAndUpdate(
    { _id: id },
    { isLoggedIn: false, loggedOutAt: new Date() },
    { new: true }
  );
  return findUserById;
};

const authSercvices = {
  logIn,
  logOut,
};
export default authSercvices;
