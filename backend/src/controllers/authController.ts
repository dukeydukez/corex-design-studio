/**
 * Authentication controller
 * HTTP request handlers for auth routes
 */

import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { asyncHandler } from '../middleware/errorHandler';
import logger from '../utils/logger';

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const { email, password, firstName, lastName } = req.body;

    const result = await AuthService.register(email, password, firstName, lastName);

    logger.info('User registered', { userId: result.user.id, email });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: result.user,
        tokens: result.tokens,
      },
    });
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const result = await AuthService.login(email, password);

    logger.info('User logged in', { userId: result.user.id, email });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
        tokens: result.tokens,
      },
    });
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    // refreshToken pre-validated by Zod middleware
    const { refreshToken } = req.body;

    const result = await AuthService.refreshToken(refreshToken);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        tokens: result.tokens,
      },
    });
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    logger.info('User logged out', { userId: req.user?.id });

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'Current user',
      data: {
        user: req.user,
      },
    });
  }),
};
