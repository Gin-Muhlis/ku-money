import * as accountDatasource from '../../datasource/account.datasource.js';
import * as transactionDatasource from '../../datasource/transaction.datasource.js';

/**
 * Create new account
 */
export const createAccount = async (req, res) => {
  const { title, icon, description, balance } = req.body;

  try {
    const accountData = {
      createdBy: {
        _id: req.user.id,
        email: req.user.email,
      },
      title,
      icon,
      description: description || '',
      balance: balance || 0,
    };

    const account = await accountDatasource.createAccount(accountData);

    res.status(201).json({
      message: 'Account created successfully',
      data: account,
      subscription: req.subscription, // Info from checkAccountLimit middleware
    });
  } catch (error) {
    console.error('Create Account Error:', error);
    res.status(500).json({
      message: error.message,
      code: 'INTERNAL_ERROR',
    });
  }
};

/**
 * Get all accounts for current user
 */
export const getAccounts = async (req, res) => {
  try {
    const accounts = await accountDatasource.findAccountsByUserId(req.user.id);

    // Calculate total balance
    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

    res.status(200).json({
      data: accounts,
      total: accounts.length,
      totalBalance,
    });
  } catch (error) {
    console.error('Get Accounts Error:', error);
    res.status(500).json({
      message: error.message,
      code: 'INTERNAL_ERROR',
    });
  }
};

/**
 * Get account by ID
 */
export const getAccountById = async (req, res) => {
  const { id } = req.params;

  try {
    const account = await accountDatasource.findAccountByIdAndUserId(
      id,
      req.user.id
    );

    if (!account) {
      return res.status(404).json({
        message: 'Account not found',
        code: 'ACCOUNT_NOT_FOUND',
      });
    }

    res.status(200).json({
      data: account,
    });
  } catch (error) {
    console.error('Get Account By ID Error:', error);
    res.status(500).json({
      message: error.message,
      code: 'INTERNAL_ERROR',
    });
  }
};

/**
 * Update account by ID
 */
export const updateAccount = async (req, res) => {
  const { id } = req.params;
  const { title, icon, description, balance } = req.body;

  try {
    const updateData = {};
    
    if (title !== undefined) updateData.title = title;
    if (icon !== undefined) updateData.icon = icon;
    if (description !== undefined) updateData.description = description;
    if (balance !== undefined) updateData.balance = balance;

    const account = await accountDatasource.updateAccountById(
      id,
      req.user.id,
      updateData
    );

    if (!account) {
      return res.status(404).json({
        message: 'Account not found',
        code: 'ACCOUNT_NOT_FOUND',
      });
    }

    res.status(200).json({
      message: 'Account updated successfully',
      data: account,
    });
  } catch (error) {
    console.error('Update Account Error:', error);
    res.status(500).json({
      message: error.message,
      code: 'INTERNAL_ERROR',
    });
  }
};

/**
 * Delete account by ID
 */
export const deleteAccount = async (req, res) => {
  const { id } = req.params;

  try {
    // Get account first to get the name
    const account = await accountDatasource.findAccountByIdAndUserId(
      id,
      req.user.id
    );

    if (!account) {
      return res.status(404).json({
        message: 'Account not found',
        code: 'ACCOUNT_NOT_FOUND',
      });
    }

    // Update all transactions that use this account with snapshot
    const accountSnapshot = account.title;
    const updateResult = await transactionDatasource.updateAccountSnapshot(
      id,
      accountSnapshot
    );

    // Delete account
    await accountDatasource.deleteAccountById(id, req.user.id);

    res.status(200).json({
      message: 'Account deleted successfully',
      data: account,
    });
  } catch (error) {
    console.error('Delete Account Error:', error);
    res.status(500).json({
      message: error.message,
      code: 'INTERNAL_ERROR',
    });
  }
};

