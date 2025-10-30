import express from 'express';
import { 
  createOrder, 
  getOrderStatus, 
  getUserOrders 
} from '../controllers/order/order.controller.js';
import { xenditWebhook } from '../controllers/order/webhook.controller.js';

// Middleware imports
import { authMiddleware } from '../middlewares/auth/auth.middleware.js';
import { validate } from '../middlewares/validator.middleware.js';

// DTO imports
import { createOrderDto } from '../dto/createOrder.dto.js';

const router = express.Router();

// Public routes (webhook dari Xendit, tidak perlu auth)
router.post('/webhook/xendit', xenditWebhook);

// Protected routes (auth required)
router.post('/create', authMiddleware, validate(createOrderDto), createOrder);
router.get('/status/:transactionId', authMiddleware, getOrderStatus);
router.get('/my-orders', authMiddleware, getUserOrders);

export default router;

