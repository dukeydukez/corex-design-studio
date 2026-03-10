/**
 * Helper utilities tests
 */

import { generateTokens, hashPassword, comparePasswords } from '../utils/auth';

describe('Auth Utilities', () => {
  describe('generateTokens', () => {
    it('should generate access and refresh tokens', () => {
      const tokens = generateTokens('user_123', 'test@example.com', 'org_123', 'admin');

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
    });

    it('should create different tokens for different users', () => {
      const tokens1 = generateTokens('user_123', 'test1@example.com');
      const tokens2 = generateTokens('user_456', 'test2@example.com');

      expect(tokens1.accessToken).not.toBe(tokens2.accessToken);
      expect(tokens1.refreshToken).not.toBe(tokens2.refreshToken);
    });
  });

  describe('hashPassword', () => {
    it('should hash password successfully', async () => {
      const password = 'MyPassword123!';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(20);
    });

    it('should create different hashes for same password', async () => {
      const password = 'MyPassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePasswords', () => {
    it('should match correct password', async () => {
      const password = 'MyPassword123!';
      const hash = await hashPassword(password);
      const isMatch = await comparePasswords(password, hash);

      expect(isMatch).toBe(true);
    });

    it('should not match incorrect password', async () => {
      const password = 'MyPassword123!';
      const hash = await hashPassword(password);
      const isMatch = await comparePasswords('WrongPassword', hash);

      expect(isMatch).toBe(false);
    });
  });
});
