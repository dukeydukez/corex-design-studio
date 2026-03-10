/**
 * Authentication utilities
 * JWT generation, password hashing, token management
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config';

export const generateTokens = (userId: string, email: string, organizationId?: string, role: string = 'member') => {
  const payload = { id: userId, email, organizationId, role };

  const accessToken = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as string,
  } as jwt.SignOptions);

  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn as string,
  } as jwt.SignOptions);

  return { accessToken, refreshToken };
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePasswords = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret) as any;
  } catch (error) {
    return null;
  }
};
