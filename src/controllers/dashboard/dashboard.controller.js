import Transaction from '../../models/Transaction.model.js';
import * as accountDatasource from '../../datasource/account.datasource.js';

/**
 * Build query filter based on request parameters
 */
const buildFilterQuery = (userId, options = {}) => {
  const { fromDate, toDate, accountId } = options;
  const query = { 'createdBy._id': userId };

  // Filter by date range
  if (fromDate || toDate) {
    query.paymentDate = {};
    if (fromDate) {
      query.paymentDate.$gte = new Date(fromDate);
    }
    if (toDate) {
      // Set to end of day for toDate
      const endDate = new Date(toDate);
      endDate.setHours(23, 59, 59, 999);
      query.paymentDate.$lte = endDate;
    }
  }

  // Filter by account
  if (accountId) {
    query.accountId = accountId;
  }

  return query;
};

/**
 * Get Dashboard Summary
 * Returns total balance, income this month, expenses this month, and total transactions
 */
export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fromDate, toDate, accountId } = req.query;

    // Build filter query
    const filterQuery = buildFilterQuery(userId, { fromDate, toDate, accountId });

    // Get all transactions matching the filter
    const transactions = await Transaction.find(filterQuery)
      .populate('categoryId', 'type');

    // Calculate total income and expenses
    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach(transaction => {
      if (transaction.categoryId && transaction.categoryId.type === 'incomes') {
        totalIncome += transaction.amount;
      } else if (transaction.categoryId && transaction.categoryId.type === 'expenses') {
        totalExpenses += transaction.amount;
      }
    });

    // Calculate total balance (get from accounts if no account filter, otherwise calculate from transactions)
    let totalBalance = 0;
    if (accountId) {
      // If filtering by account, get balance from that specific account
      const account = await accountDatasource.findAccountById(accountId);
      totalBalance = account ? account.balance : 0;
    } else {
      // Get total balance from all accounts
      const accounts = await accountDatasource.findAccountsByUserId(userId);
      totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
    }

    const totalTransactions = transactions.length;

    res.status(200).json({
      totalBalance,
      totalIncome,
      totalExpenses,
      totalTransactions,
    });
  } catch (error) {
    console.error('Get Dashboard Summary Error:', error);
    res.status(500).json({
      message: error.message,
      code: 'INTERNAL_ERROR',
    });
  }
};

/**
 * Get Expenses by Category
 * Returns expense transactions grouped by category
 */
export const getExpensesByCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fromDate, toDate, accountId } = req.query;

    // Build filter query
    const filterQuery = buildFilterQuery(userId, { fromDate, toDate, accountId });

    // Get all expense transactions
    const transactions = await Transaction.find(filterQuery)
      .populate('categoryId', 'title icon type');

    // Group by category
    const categoryMap = {};
    transactions.forEach(transaction => {
      if (transaction.categoryId && transaction.categoryId.type === 'expenses') {
        const categoryId = transaction.categoryId._id.toString();
        const categoryTitle = transaction.categoryId.title;
        const categoryIcon = transaction.categoryId.icon;

        if (!categoryMap[categoryId]) {
          categoryMap[categoryId] = {
            categoryId: categoryId,
            categoryName: transaction.categorySnapshot || categoryTitle,
            categoryIcon: categoryIcon,
            totalAmount: 0,
          };
        }

        categoryMap[categoryId].totalAmount += transaction.amount;
      }
    });

    // Convert to array and sort by total amount descending
    const categories = Object.values(categoryMap)
      .sort((a, b) => b.totalAmount - a.totalAmount);

    res.status(200).json({
      data: categories,
      total: categories.length,
    });
  } catch (error) {
    console.error('Get Expenses by Category Error:', error);
    res.status(500).json({
      message: error.message,
      code: 'INTERNAL_ERROR',
    });
  }
};

/**
 * Get Income vs Expenses Trend
 * Returns income and expenses grouped by time period (daily, monthly)
 */
export const getIncomeVsExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fromDate, toDate, accountId, periodType = 'daily' } = req.query;

    // Build filter query
    const filterQuery = buildFilterQuery(userId, { fromDate, toDate, accountId });

    // Get all transactions
    const transactions = await Transaction.find(filterQuery)
      .populate('categoryId', 'type')
      .sort({ paymentDate: 1 });

    // Group by period
    const periodMap = {};
    transactions.forEach(transaction => {
      if (!transaction.categoryId) return;

      const date = new Date(transaction.paymentDate);
      let periodKey;

      if (periodType === 'monthly') {
        // Format: YYYY-MM
        const month = String(date.getMonth() + 1).length === 1 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
        periodKey = `${date.getFullYear()}-${month}`;
      } else {
        // Default: daily, Format: YYYY-MM-DD
        const month = String(date.getMonth() + 1).length === 1 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
        const day = String(date.getDate()).length === 1 ? `0${date.getDate()}` : date.getDate();
        periodKey = `${date.getFullYear()}-${month}-${day}`;
      }

      if (!periodMap[periodKey]) {
        periodMap[periodKey] = {
          period: periodKey,
          income: 0,
          expenses: 0,
        };
      }

      if (transaction.categoryId.type === 'incomes') {
        periodMap[periodKey].income += transaction.amount;
      } else if (transaction.categoryId.type === 'expenses') {
        periodMap[periodKey].expenses += transaction.amount;
      }
    });

    // Convert to array and sort by period
    const trends = Object.values(periodMap)
      .sort((a, b) => a.period.localeCompare(b.period));

    res.status(200).json({
      data: trends,
      total: trends.length,
    });
  } catch (error) {
    console.error('Get Income vs Expenses Error:', error);
    res.status(500).json({
      message: error.message,
      code: 'INTERNAL_ERROR',
    });
  }
};

/**
 * Get Recent Transactions
 * Returns latest transactions with pagination
 */
export const getRecentTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fromDate, toDate, accountId, limit = 10, page = 1 } = req.query;

    // Build filter query
    const filterQuery = buildFilterQuery(userId, { fromDate, toDate, accountId });

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get transactions with pagination
    const transactions = await Transaction.find(filterQuery)
      .populate('accountId', 'title icon')
      .populate('categoryId', 'title icon type')
      .sort({ paymentDate: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count
    const total = await Transaction.countDocuments(filterQuery);

    res.status(200).json({
      data: transactions.map(transaction => ({
        _id: transaction._id,
        accountId: transaction.accountId || null,
        accountSnapshot: transaction.accountSnapshot,
        categoryId: transaction.categoryId || null,
        categorySnapshot: transaction.categorySnapshot,
        amount: transaction.amount,
        note: transaction.note,
        paymentDate: transaction.paymentDate,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      })),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get Recent Transactions Error:', error);
    res.status(500).json({
      message: error.message,
      code: 'INTERNAL_ERROR',
    });
  }
};

