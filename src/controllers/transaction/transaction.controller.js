import * as transactionDatasource from '../../datasource/transaction.datasource.js';
import * as accountDatasource from '../../datasource/account.datasource.js';
import Category from '../../models/Category.model.js';

/**
 * Create new transaction
 */
export const createTransaction = async (req, res) => {
  const { accountId, categoryId, amount, note, paymentDate } = req.body;

  try {
    // Verify account belongs to user
    const account = await accountDatasource.findAccountByIdAndUserId(accountId, req.user.id);
    if (!account) {
      return res.status(404).json({
        message: 'Account not found or does not belong to you',
        code: 'ACCOUNT_NOT_FOUND',
      });
    }

    // Verify category belongs to user
    const category = await Category.findOne({
      _id: categoryId,
      'createdBy._id': req.user.id,
    });
    if (!category) {
      return res.status(404).json({
        message: 'Category not found or does not belong to you',
        code: 'CATEGORY_NOT_FOUND',
      });
    }

    const transactionData = {
      createdBy: {
        _id: req.user.id,
        email: req.user.email,
      },
      accountId,
      categoryId,
      amount,
      note: note || '',
      paymentDate: paymentDate || new Date(),
    };

    const transaction = await transactionDatasource.createTransaction(transactionData);

    // Update account balance
    const balanceChange = category.type === 'incomes' ? amount : -amount;
    await accountDatasource.updateAccountBalance(accountId, req.user.id, balanceChange);

    // Populate the transaction
    const populatedTransaction = await transactionDatasource.findTransactionById(transaction._id);

    res.status(201).json({
      message: 'Transaction created successfully',
      data: populatedTransaction,
      transactionLimit: req.transactionLimit, // Info from middleware
    });
  } catch (error) {
    console.error('Create Transaction Error:', error);
    res.status(500).json({
      message: error.message,
      code: 'INTERNAL_ERROR',
    });
  }
};

/**
 * Get transactions with pagination and grouping by date
 */
export const getTransactions = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      categoryType, 
      accountId, 
      startDate, 
      endDate,
      grouped = 'true' // Default to grouped by date
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      categoryType,
      accountId,
      startDate,
      endDate,
    };

    // Return grouped by date or flat list
    if (grouped === 'true') {
      const result = await transactionDatasource.findTransactionsGroupedByDate(
        req.user.id,
        options
      );

      res.status(200).json({
        ...result,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalGroups: result.total,
          totalPages: Math.ceil(result.total / parseInt(limit)),
        },
      });
    } else {
      const { transactions, total } = await transactionDatasource.findTransactionsByUserId(
        req.user.id,
        options
      );

      res.status(200).json({
        data: transactions,
        total,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      });
    }
  } catch (error) {
    console.error('Get Transactions Error:', error);
    res.status(500).json({
      message: error.message,
      code: 'INTERNAL_ERROR',
    });
  }
};

/**
 * Get transaction by ID
 */
export const getTransactionById = async (req, res) => {
  const { id } = req.params;

  try {
    const transaction = await transactionDatasource.findTransactionByIdAndUserId(
      id,
      req.user.id
    );

    if (!transaction) {
      return res.status(404).json({
        message: 'Transaction not found',
        code: 'TRANSACTION_NOT_FOUND',
      });
    }

    res.status(200).json({
      data: transaction,
    });
  } catch (error) {
    console.error('Get Transaction By ID Error:', error);
    res.status(500).json({
      message: error.message,
      code: 'INTERNAL_ERROR',
    });
  }
};

/**
 * Update transaction by ID
 */
export const updateTransaction = async (req, res) => {
  const { id } = req.params;
  const { accountId, categoryId, amount, note, paymentDate } = req.body;

  try {
    // Get old transaction to reverse balance change
    const oldTransaction = await transactionDatasource.findTransactionByIdAndUserId(
      id,
      req.user.id
    );

    if (!oldTransaction) {
      return res.status(404).json({
        message: 'Transaction not found',
        code: 'TRANSACTION_NOT_FOUND',
      });
    }

    // Verify new account if changed
    if (accountId && accountId !== oldTransaction.accountId.toString()) {
      const account = await accountDatasource.findAccountByIdAndUserId(accountId, req.user.id);
      if (!account) {
        return res.status(404).json({
          message: 'New account not found',
          code: 'ACCOUNT_NOT_FOUND',
        });
      }
    }

    // Verify new category if changed
    if (categoryId && categoryId !== oldTransaction.categoryId._id.toString()) {
      const category = await Category.findOne({
        _id: categoryId,
        'createdBy._id': req.user.id,
      });
      if (!category) {
        return res.status(404).json({
          message: 'New category not found',
          code: 'CATEGORY_NOT_FOUND',
        });
      }
    }

    // Reverse old balance change
    const oldBalanceChange = oldTransaction.categoryId.type === 'incomes' 
      ? -oldTransaction.amount 
      : oldTransaction.amount;
    await accountDatasource.updateAccountBalance(
      oldTransaction.accountId._id,
      req.user.id,
      oldBalanceChange
    );

    // Update transaction
    const updateData = {};
    if (accountId !== undefined) updateData.accountId = accountId;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (amount !== undefined) updateData.amount = amount;
    if (note !== undefined) updateData.note = note;
    if (paymentDate !== undefined) updateData.paymentDate = paymentDate;

    const updatedTransaction = await transactionDatasource.updateTransactionById(
      id,
      req.user.id,
      updateData
    );

    // Apply new balance change
    const newBalanceChange = updatedTransaction.categoryId.type === 'incomes' 
      ? updatedTransaction.amount 
      : -updatedTransaction.amount;
    await accountDatasource.updateAccountBalance(
      updatedTransaction.accountId._id,
      req.user.id,
      newBalanceChange
    );

    res.status(200).json({
      message: 'Transaction updated successfully',
      data: updatedTransaction,
    });
  } catch (error) {
    console.error('Update Transaction Error:', error);
    res.status(500).json({
      message: error.message,
      code: 'INTERNAL_ERROR',
    });
  }
};

/**
 * Delete transaction by ID
 */
export const deleteTransaction = async (req, res) => {
  const { id } = req.params;

  try {
    // Get transaction to reverse balance change
    const transaction = await transactionDatasource.findTransactionByIdAndUserId(
      id,
      req.user.id
    );

    if (!transaction) {
      return res.status(404).json({
        message: 'Transaction not found',
        code: 'TRANSACTION_NOT_FOUND',
      });
    }

    // Reverse balance change
    const balanceChange = transaction.categoryId.type === 'incomes' 
      ? -transaction.amount 
      : transaction.amount;
    await accountDatasource.updateAccountBalance(
      transaction.accountId._id,
      req.user.id,
      balanceChange
    );

    // Delete transaction
    await transactionDatasource.deleteTransactionById(id, req.user.id);

    res.status(200).json({
      message: 'Transaction deleted successfully',
      data: transaction,
    });
  } catch (error) {
    console.error('Delete Transaction Error:', error);
    res.status(500).json({
      message: error.message,
      code: 'INTERNAL_ERROR',
    });
  }
};

