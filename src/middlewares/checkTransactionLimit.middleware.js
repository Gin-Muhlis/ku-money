import * as subscriptionDatasource from '../datasource/subscription.datasource.js';
import * as transactionDatasource from '../datasource/transaction.datasource.js';
import * as accountDatasource from '../datasource/account.datasource.js';
import Category from '../models/Category.model.js';

/**
 * Middleware to check if user has reached transaction limit based on category type
 * Must be used after authMiddleware
 * Requires categoryId in request body
 */
export const checkTransactionLimit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { categoryId, amount } = req.body;

    if (!categoryId) {
      return res.status(400).json({
        message: 'Category ID is required',
        code: 'CATEGORY_ID_REQUIRED',
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: 'Amount is required and must be greater than 0',
        code: 'INVALID_AMOUNT',
      });
    }

    // Get category to determine type
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({
        message: 'Category not found',
        code: 'CATEGORY_NOT_FOUND',
      });
    }

    // Get active subscription
    const subscription = await subscriptionDatasource.findActiveSubscriptionByUserId(userId);

    if (!subscription) {
      return res.status(403).json({
        message: 'No active subscription found',
        code: 'NO_SUBSCRIPTION',
      });
    }

    // Determine limit based on category type
    const categoryType = category.type; // 'incomes' or 'expenses'
    let limit;

    if (categoryType === 'incomes') {
      limit = subscription.limitIncomes;
    } else if (categoryType === 'expenses') {
      limit = subscription.limitExpenses;
    } else {
      return res.status(400).json({
        message: 'Invalid category type',
        code: 'INVALID_CATEGORY_TYPE',
      });
    }

    // Check if limit is unlimited (0 means unlimited)
    if (limit === 0) {
      return next();
    }

    // Check limit based on category type
    let currentTotal = 0;

    if (categoryType === 'incomes') {
      // For incomes: check if total balance + new amount exceeds limit
      const totalBalance = await accountDatasource.getTotalBalanceByUserId(userId);
      currentTotal = totalBalance + amount;
    } else if (categoryType === 'expenses') {
      // For expenses: check if total expenses + new amount exceeds limit
      const totalExpenses = await transactionDatasource.getTotalExpensesByUserId(userId);
      currentTotal = totalExpenses + amount;
    }

    // Check if user has reached the limit
    if (currentTotal > limit) {
      return res.status(403).json({
        message: `Transaction limit reached for ${categoryType}`,
        code: 'TRANSACTION_LIMIT_REACHED',
        type: categoryType,
        limit: limit,
        current: currentTotal - amount,
        newAmount: amount,
        afterUpdate: currentTotal,
      });
    }

    next();
  } catch (error) {
    console.error('Check Transaction Limit Error:', error);
    res.status(500).json({
      message: 'Error checking transaction limit',
      code: 'INTERNAL_ERROR',
      error: error.message,
    });
  }
};

