/**
 * Tests for authentication service
 */

import { AuthService } from '../services/AuthService';
import { UserRepository } from '../repositories/UserRepository';
import { AppError } from '../middleware/errorHandler';

jest.mock('../repositories/UserRepository');
jest.mock('../utils/auth', () => ({
  hashPassword: jest.fn(async (pwd) => `hash_${pwd}`),
  comparePasswords: jest.fn(async (pwd, hash) => hash === `hash_${pwd}`),
  generateTokens: jest.fn(() => ({
    accessToken: 'access_token',
    refreshToken: 'refresh_token',
  })),
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        id: 'user_123',
        email: 'test@example.com',
        firstName: 'Test',
        organizationId: null,
        createdAt: new Date(),
      };

      (UserRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (UserRepository.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await AuthService.register('test@example.com', 'password123', 'Test');

      expect(result.user.email).toBe('test@example.com');
      expect(result.tokens.accessToken).toBe('access_token');
      expect(UserRepository.create).toHaveBeenCalled();
    });

    it('should throw error if user exists', async () => {
      const existingUser = { id: 'user_123', email: 'test@example.com' };
      (UserRepository.findByEmail as jest.Mock).mockResolvedValue(existingUser);

      await expect(
        AuthService.register('test@example.com', 'password123')
      ).rejects.toThrow('User with this email already exists');
    });
  });

  describe('login', () => {
    it('should login user successfully with correct password', async () => {
      const mockUser = {
        id: 'user_123',
        email: 'test@example.com',
        passwordHash: 'hash_password123',
        firstName: 'Test',
        organizationId: null,
      };

      (UserRepository.findByEmailWithPassword as jest.Mock).mockResolvedValue(mockUser);

      const result = await AuthService.login('test@example.com', 'password123');

      expect(result.user.email).toBe('test@example.com');
      expect(result.tokens.accessToken).toBe('access_token');
    });

    it('should throw error with invalid email', async () => {
      (UserRepository.findByEmailWithPassword as jest.Mock).mockResolvedValue(null);

      await expect(
        AuthService.login('nonexistent@example.com', 'password123')
      ).rejects.toThrow('Invalid email or password');
    });

    it('should throw error with invalid password', async () => {
      const mockUser = {
        id: 'user_123',
        email: 'test@example.com',
        passwordHash: 'hash_password123',
        firstName: 'Test',
        organizationId: null,
      };

      (UserRepository.findByEmailWithPassword as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        AuthService.login('test@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid email or password');
    });
  });
});
