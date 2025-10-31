import express from 'express';
import { getUserSubscription } from '../controllers/subscription/subscription.controller.js';

// Middleware imports
import { authMiddleware } from '../middlewares/auth/auth.middleware.js';

const router = express.Router();

// Protected routes (auth required)
router.get('/', authMiddleware, getUserSubscription);

export default router;

