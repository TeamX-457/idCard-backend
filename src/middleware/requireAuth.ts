import { Request, Response, NextFunction } from "express";
import { verifyToken, TokenPayload } from "../lib/jwt.js";
import { AppError } from "./errorHandler.js";

// for TS to know that the user exists
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Not authorized, no token provided", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    next(new AppError("Not authorized, invalid or expired token", 401));
  }
};