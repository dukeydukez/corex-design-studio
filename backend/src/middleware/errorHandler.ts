/**
 * Error handling middleware
 * Catches and formats errors consistently
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errors?: any
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof AppError) {
    logger.error(`[${req.method}] ${req.path} - ${error.message}`, { errors: error.errors });
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errors: error.errors,
    });
  }

  logger.error(`[${req.method}] ${req.path} - ${error.message}`);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    errors: process.env.NODE_ENV === 'development' ? { details: error.message } : undefined,
  });
};

export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
