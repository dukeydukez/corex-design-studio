/**
 * HTTP request logging middleware
 * Logs all incoming requests with response time
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'error' : 'info';
    
    logger[logLevel as 'info' | 'error'](
      `[${req.method}] ${req.path} - ${res.statusCode} ${duration}ms`,
      {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration,
        userId: (req as any).user?.id || 'anonymous',
      }
    );
  });

  next();
};
