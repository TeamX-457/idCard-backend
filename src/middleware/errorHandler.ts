import { Request, Response, NextFunction } from 'express';

// Specific Error Class
// used for throwing known errors
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; 

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong on the server';

  console.error(`[ERROR] ${err.name}: ${message}`);

  res.status(statusCode).json({
    success: false,
    error: {
      message,

      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
  });
};