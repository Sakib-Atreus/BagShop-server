import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import authUtil from "../modules/auth/auth.util";
import { TUserRole } from "../constent";
import catchAsync from "../util/catchAsync";
import idConverter from "../util/idConvirter";
import UserModel from "../modules/users/users.model";
// import UserModel from '../modules/user/user.model';

const auth = (...requiredUserRoles: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authorizationToken = req?.headers?.authorization;

    if (!authorizationToken) {
      throw new Error("Unauthorized User: Missing Authorization Token");
    }

    // Decode JWT Token
    const decoded = authUtil.decodeAuthorizationToken(authorizationToken);

    if (!decoded) {
      throw new Error("Unauthorized User: Token decoding failed");
    }

    const { id, role, iat } = decoded as JwtPayload;

    // Convert hex ID to ObjectId
    const convertedObjectId = idConverter(id);

    // Check if the user's role is allowed
    if (requiredUserRoles.length && !requiredUserRoles.includes(role)) {
      throw new Error("Unauthorized User: Role not permitted");
    }

    // Find the user in the database
    const findUser = await UserModel.findOne({
      _id: id,
      isLoggedIn: true,
      isDeleted: false,
    });

    if (!findUser) {
      throw new Error("Unauthorized User: Forbidden Access");
    }

    // Check if the user has logged out after the token was issued
    const logOutTime =
      findUser.loggedOutAt instanceof Date
        ? findUser.loggedOutAt.getTime() / 1000
        : null;

    if (logOutTime && iat && iat < logOutTime) {
      throw new Error(
        "Unauthorized User: Your session has expired. Please log in again"
      );
    }

    // Attach user information to the request
    // console.log(req?.user)
    req.user = decoded as JwtPayload;

    // Proceed to the next middleware
    next();
  });
};

export default auth;
