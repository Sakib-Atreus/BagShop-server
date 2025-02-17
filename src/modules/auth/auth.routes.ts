import express from "express";
import authController from "./auth.controller";
const authRouter = express.Router();

authRouter.post("/logIn", authController.logIn);
authRouter.post("/logOut", authController.logOut);

export default authRouter;
