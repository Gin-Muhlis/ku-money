import express from 'express';
import {
  createAccount,
  getAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
} from '../controllers/account/account.controller.js';

// Middleware imports
import { authMiddleware } from '../middlewares/auth/auth.middleware.js';
import { checkAccountLimit } from '../middlewares/checkAccountLimit.middleware.js';
import { validate } from '../middlewares/validator.middleware.js';

// DTO imports
import { createAccountDto, updateAccountDto } from '../dto/account.dto.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Create account (with limit check)
router.post('/', checkAccountLimit, validate(createAccountDto), createAccount);

// Get all accounts
router.get('/', getAccounts);

// Get account by ID
router.get('/:id', getAccountById);

// Update account by ID
router.put('/:id', validate(updateAccountDto), updateAccount);

// Delete account by ID
router.delete('/:id', deleteAccount);

export default router;

