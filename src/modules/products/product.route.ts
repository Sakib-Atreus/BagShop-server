import express from "express";

import auth from "../../middleWare/auth";
import { userRole } from "../../constent";
import { ProductControllers } from "./product.controller";
import { upload } from "../../util/uploadImgToCloudynary";
import { variantControllers } from "../variant/variant.controller";

const router = express.Router();

// this all routes call the controllers function to :
router.post(
  "/create-product",
  auth(userRole.seller),
  upload.array("images", 2),
  ProductControllers.createProduct
);

router.post(
  "/create-variant",
  auth(userRole.seller),
  upload.array("images", 2),
  variantControllers.createVariant
);

router.get("/all-product", ProductControllers.getAllProducts);

router.get("/:productId", ProductControllers.getSingleProduct);

router.delete("/:productId", ProductControllers.deleteProduct);

router.put("/:productId", ProductControllers.updateProduct);

export const ProductRoute = router;
