import express from 'express';
import {
  register,
  login,
  logout,
  refresh,
  updatePassword,
  getUserById,
} from '../controllers/auth/auth.controller.js';
import {
  verifyEmail,
  resendVerificationEmail,
} from '../controllers/auth/verifyEmail.controller.js';

// Middleware imports
import { authMiddleware } from '../middlewares/auth/auth.middleware.js';
import { refreshTokenMiddleware } from '../middlewares/auth/refreshToken.middleware.js';
import { validate } from '../middlewares/validator.middleware.js';

// DTO imports
import { 
  registerDto, 
  loginDto, 
  refreshDto, 
  verifyEmailDto, 
  resendVerificationDto,
  updatePasswordDto
} from '../dto/auth.dto.js';

const router = express.Router();

// Public routes (no auth required)
router.post('/register', validate(registerDto), register);
router.post('/login', validate(loginDto), login);
router.post('/verify', validate(verifyEmailDto), verifyEmail);
router.post('/resend-verification', validate(resendVerificationDto), resendVerificationEmail);

// Protected routes (auth required)
router.get('/me', authMiddleware, getUserById);
router.post('/logout', authMiddleware, logout);
router.put('/password', authMiddleware, validate(updatePasswordDto), updatePassword);

// Refresh token route (uses refresh token middleware)
router.post('/refresh', validate(refreshDto), refreshTokenMiddleware, refresh);

export default router;
