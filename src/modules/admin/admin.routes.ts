import express from "express";
import adminController from "./admin.controller";
const AdminRoute = express.Router();

AdminRoute.get("/getAllShops", adminController.getAllShops);
AdminRoute.get("/getAllShopRequests", adminController.getAllShopRequests);
AdminRoute.patch("/approveOrDenyShopReq", adminController.approveOrDenyShopReq);

export default AdminRoute;
