import express from 'express';
import {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transaction/transaction.controller.js';

// Middleware imports
import { authMiddleware } from '../middlewares/auth/auth.middleware.js';
import { checkTransactionLimit } from '../middlewares/checkTransactionLimit.middleware.js';
import { validate } from '../middlewares/validator.middleware.js';

// DTO imports
import { createTransactionDto, updateTransactionDto } from '../dto/transaction.dto.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Create transaction (with limit check)
router.post('/', checkTransactionLimit, validate(createTransactionDto), createTransaction);

// Get all transactions (with pagination & grouping)
router.get('/', getTransactions);

// Get transaction by ID
router.get('/:id', getTransactionById);

// Update transaction by ID
router.put('/:id', validate(updateTransactionDto), updateTransaction);

// Delete transaction by ID
router.delete('/:id', deleteTransaction);

export default router;

