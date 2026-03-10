/**
 * Authentication service
 * Business logic for user authentication
 */

import { AppError } from '../middleware/errorHandler';
import { UserRepository } from '../repositories/UserRepository';
import { hashPassword, comparePasswords, generateTokens } from '../utils/auth';

export class AuthService {
  static async register(email: string, password: string, firstName?: string, lastName?: string) {
    // Check if user exists
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError(409, 'User with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await UserRepository.create({
      email,
      passwordHash,
      firstName,
      lastName,
    });

    // Generate tokens
    const tokens = generateTokens(user.id, user.email, user.organizationId, 'member');

    return { user, tokens };
  }

  static async login(email: string, password: string) {
    // Find user with password
    const user = await UserRepository.findByEmailWithPassword(email);
    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Check password
    const isPasswordValid = await comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Generate tokens
    const tokens = generateTokens(user.id, user.email, user.organizationId, 'member');

    return { user, tokens };
  }

  static async refreshToken(refreshToken: string) {
    try {
      // Verify refresh token
      const decoded = require('jsonwebtoken').verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production'
      ) as any;

      // Find user
      const user = await UserRepository.findById(decoded.id);
      if (!user) {
        throw new AppError(401, 'User not found');
      }

      // Generate new tokens
      const tokens = generateTokens(user.id, user.email, user.organizationId, 'member');

      return { user, tokens };
    } catch (error) {
      throw new AppError(401, 'Invalid or expired refresh token');
    }
  }
}
