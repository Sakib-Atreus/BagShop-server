import express from "express";
import authRouter from "../modules/auth/auth.routes";
import { ProductRoute } from "../modules/products/product.route";
import { ProductListRoute } from "../modules/productList/productlist.route";
import UserRoutes from "../modules/users/users.routes";
import AdminRoute from "../modules/admin/admin.routes";
import { WishlistRoute } from "../modules/wishlist/wishlist.route";
import CartRoutes from "../modules/cart/cart.route";

import { ReviewRoute } from "../modules/reviews/review.route";
const Routes = express.Router();

// Array of module routes
const moduleRouts = [
  {
    path: "/auth",
    router: authRouter,
  },

  {
    path: "/products",
    router: ProductRoute,
  },
  {
    path: "/productlist",
    router: ProductListRoute,
  },
  {
    path: "/admin",
    router: AdminRoute,
  },
  {
    path: "/user",
    router: UserRoutes,
  },
  {
    path: "/wishlist",
    router: WishlistRoute,
  },
  {
    path: "/cart",
    router: CartRoutes,
  },
  {
    path: "/review",
    router: ReviewRoute,
  },
];

// Register each route in moduleRouts
moduleRouts.forEach(({ path, router }) => {
  // console.log("path:",path,router)
  Routes.use(path, router);
});

// Export the router
export default Routes;
