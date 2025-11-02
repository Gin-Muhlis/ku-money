import Account from '../models/Account.model.js';

/**
 * Create new account
 */
export const createAccount = async (accountData) => {
  return await Account.create(accountData);
};

/**
 * Find account by ID
 */
export const findAccountById = async (accountId) => {
  return await Account.findById(accountId);
};

/**
 * Find account by ID and user ID
 */
export const findAccountByIdAndUserId = async (accountId, userId) => {
  return await Account.findOne({
    _id: accountId,
    'createdBy._id': userId,
  });
};

/**
 * Find all accounts by user ID
 */
export const findAccountsByUserId = async (userId) => {
  return await Account.find({ 'createdBy._id': userId }).sort({ createdAt: -1 });
};

/**
 * Count accounts by user ID
 */
export const countAccountsByUserId = async (userId) => {
  return await Account.countDocuments({ 'createdBy._id': userId });
};

/**
 * Update account by ID
 */
export const updateAccountById = async (accountId, userId, updateData) => {
  return await Account.findOneAndUpdate(
    { _id: accountId, 'createdBy._id': userId },
    updateData,
    { new: true }
  );
};

/**
 * Delete account by ID
 */
export const deleteAccountById = async (accountId, userId) => {
  return await Account.findOneAndDelete({
    _id: accountId,
    'createdBy._id': userId,
  });
};

/**
 * Update account balance
 */
export const updateAccountBalance = async (accountId, userId, balanceChange) => {
  return await Account.findOneAndUpdate(
    { _id: accountId, 'createdBy._id': userId },
    { $inc: { balance: balanceChange } },
    { new: true }
  );
};

/**
 * Get total balance of all accounts by user ID
 */
export const getTotalBalanceByUserId = async (userId) => {
  const accounts = await Account.find({ 'createdBy._id': userId });
  const totalBalance = accounts.reduce((sum, account) => sum + (account.balance || 0), 0);
  return totalBalance;
};

