import express from "express";
import { ProductListController } from "./productlist.controller";

const router = express.Router();

// router.post("/:shopID", ProductListController.addProductToShop);
// router.get("/:shopID", ProductListController.getProductsByShopID);

export const ProductListRoute = router;
