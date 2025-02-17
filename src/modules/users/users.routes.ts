import express from "express";
import userController from "./user.controller";
import auth from "../../middleWare/auth";
import { userRole } from "../../constent";

const UserRoutes = express.Router();

UserRoutes.post("/createUser", userController.createUser);
UserRoutes.post(
  "/createShop",
  auth(userRole.customer),
  userController.createShop
);
UserRoutes.post(
  "/makeAnOrder",
  auth(userRole.customer, userRole.seller),
  userController.makeAnorder
);

export default UserRoutes;
