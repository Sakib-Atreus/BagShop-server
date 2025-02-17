import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload; // Make it optional to avoid TS errors before authentication
    }
  }
}

export {}; // This ensures TypeScript treats this file as a module
