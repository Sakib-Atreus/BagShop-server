import jwt from "jsonwebtoken";
import config from "../../config";

const createToken = (tokenizeData: Record<string, any>): string => {
  // console.log(typeof(config.jwt_expires_In))
  const Token = jwt.sign(tokenizeData, config.jwt_token, { expiresIn: "4d" });
  return Token;
};

const decodeAuthorizationToken = (token: string) => {
  const decoded = jwt.verify(token, config.jwt_token);
  return decoded;
};
const decodeRefreshToken = (token: string) => {
  const decoded = jwt.verify(token, config.refresh_token_expires_in);
  return decoded;
};

const authUtil = {
  decodeAuthorizationToken,
  decodeRefreshToken,
  createToken,
};
export default authUtil;
