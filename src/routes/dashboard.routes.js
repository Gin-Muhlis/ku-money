import express from 'express';
import {
  getDashboardSummary,
  getExpensesByCategory,
  getIncomeVsExpenses,
  getRecentTransactions,
} from '../controllers/dashboard/dashboard.controller.js';

// Middleware imports
import { authMiddleware } from '../middlewares/auth/auth.middleware.js';

const router = express.Router();

// Protected routes (auth required)
router.get('/summary', authMiddleware, getDashboardSummary);
router.get('/expenses-by-category', authMiddleware, getExpensesByCategory);
router.get('/income-vs-expenses', authMiddleware, getIncomeVsExpenses);
router.get('/recent-transactions', authMiddleware, getRecentTransactions);

export default router;

