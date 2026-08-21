import { Request, Response, NextFunction } from "express";
import { z } from "zod"; 
import { AppError } from "./errorHandler.js";

export const validate = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.issues.map((issue) => issue.message).join(", ");
        next(new AppError(errorMessage, 400));
      } else {
        next(error);
      }
    }
  };
};