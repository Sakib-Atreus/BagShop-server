import express from "express";
import { CartControllers } from "./cart.controller";
import auth from "../../middleWare/auth";
import { userRole } from "../../constent";

const CartRoutes = express.Router();

CartRoutes.post(
  "/addToCart",
  auth(userRole.customer, userRole.seller),
  CartControllers.addToCart
);
CartRoutes.get(
  "/getCart",
  auth(userRole.customer, userRole.seller),
  CartControllers.getCart
);

CartRoutes.patch("/update", CartControllers.updateCart);
CartRoutes.delete("/delete", CartControllers.deleteCart);

export default CartRoutes;
