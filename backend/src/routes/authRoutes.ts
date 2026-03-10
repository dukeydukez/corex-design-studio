/**
 * Authentication routes
 * Defines all auth endpoints: register, login, refresh, logout, me
 */

import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validation/schemas';

const router = Router();

// Public routes (with input validation)
router.post('/register', validate({ body: registerSchema }), authController.register);
router.post('/login', validate({ body: loginSchema }), authController.login);
router.post('/refresh', validate({ body: refreshTokenSchema }), authController.refresh);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);

export default router;
