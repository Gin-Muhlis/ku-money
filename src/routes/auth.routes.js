import express from 'express';
import {
  register,
  login,
  logout,
  refresh,
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
import { registerDto } from '../dto/register.dto.js';
import { loginDto } from '../dto/login.dto.js';
import { refreshDto } from '../dto/refresh.dto.js';
import { verifyEmailDto } from '../dto/verifyEmail.dto.js';
import { resendVerificationDto } from '../dto/resendVerification.dto.js';

const router = express.Router();

// Public routes (no auth required)
router.post('/register', validate(registerDto), register);
router.post('/login', validate(loginDto), login);
router.post('/verify/:token', validate(verifyEmailDto), verifyEmail);
router.post('/resend-verification', validate(resendVerificationDto), resendVerificationEmail);

// Protected routes (auth required)
router.post('/logout', authMiddleware, logout);

// Refresh token route (uses refresh token middleware)
router.post('/refresh', validate(refreshDto), refreshTokenMiddleware, refresh);

export default router;
