import Transaction from '../models/Transaction.model.js';

/**
 * Create new transaction
 */
export const createTransaction = async (transactionData) => {
  return await Transaction.create(transactionData);
};

/**
 * Find transaction by ID
 */
export const findTransactionById = async (transactionId) => {
  return await Transaction.findById(transactionId)
    .populate('accountId', 'title icon')
    .populate('categoryId', 'title icon type');
};

/**
 * Find transaction by ID and user ID
 */
export const findTransactionByIdAndUserId = async (transactionId, userId) => {
  return await Transaction.findOne({
    _id: transactionId,
    'createdBy._id': userId,
  })
    .populate('accountId', 'title icon')
    .populate('categoryId', 'title icon type');
};

/**
 * Find transactions by user ID with pagination
 */
export const findTransactionsByUserId = async (userId, options = {}) => {
  const { page = 1, limit = 20, categoryType, accountId, startDate, endDate } = options;
  
  const skip = (page - 1) * limit;
  const query = { 'createdBy._id': userId };

  // Filter by date range
  if (startDate || endDate) {
    query.paymentDate = {};
    if (startDate) query.paymentDate.$gte = new Date(startDate);
    if (endDate) query.paymentDate.$lte = new Date(endDate);
  }

  // Filter by account
  if (accountId) {
    query.accountId = accountId;
  }

  // Get transactions
  const transactions = await Transaction.find(query)
    .populate('accountId', 'title icon')
    .populate('categoryId', 'title icon type')
    .sort({ paymentDate: -1, createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);

  // Filter by category type if specified (after populate)
  let filteredTransactions = transactions;
  if (categoryType) {
    filteredTransactions = transactions.filter(
      (t) => t.categoryId && t.categoryId.type === categoryType
    );
  }

  const total = await Transaction.countDocuments(query);

  return { transactions: filteredTransactions, total };
};

/**
 * Find transactions grouped by date
 */
export const findTransactionsGroupedByDate = async (userId, options = {}) => {
  const { page = 1, limit = 20, categoryType, accountId, startDate, endDate } = options;
  
  const query = { 'createdBy._id': userId };

  // Filter by date range
  if (startDate || endDate) {
    query.paymentDate = {};
    if (startDate) query.paymentDate.$gte = new Date(startDate);
    if (endDate) query.paymentDate.$lte = new Date(endDate);
  }

  // Filter by account
  if (accountId) {
    query.accountId = accountId;
  }

  // Get all transactions (we'll handle pagination after grouping)
  const transactions = await Transaction.find(query)
    .populate('accountId', 'title icon')
    .populate('categoryId', 'title icon type')
    .sort({ paymentDate: -1, createdAt: -1 });

  // Filter by category type if specified
  let filteredTransactions = transactions;
  if (categoryType) {
    filteredTransactions = transactions.filter(
      (t) => t.categoryId && t.categoryId.type === categoryType
    );
  }

  // Group by date
  const grouped = filteredTransactions.reduce((acc, transaction) => {
    const date = new Date(transaction.paymentDate);
    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: dateKey,
        transactions: [],
        totalIncomes: 0,
        totalExpenses: 0,
      };
    }

    acc[dateKey].transactions.push(transaction);

    // Calculate totals
    if (transaction.categoryId && transaction.categoryId.type === 'incomes') {
      acc[dateKey].totalIncomes += transaction.amount;
    } else if (transaction.categoryId && transaction.categoryId.type === 'expenses') {
      acc[dateKey].totalExpenses += transaction.amount;
    }

    return acc;
  }, {});

  // Convert to array and sort by date descending
  const groupedArray = Object.values(grouped).sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  // Apply pagination to grouped data
  const skip = (page - 1) * limit;
  const paginatedGroups = groupedArray.slice(skip, skip + parseInt(limit));

  return {
    data: paginatedGroups,
    total: groupedArray.length,
    totalTransactions: filteredTransactions.length,
  };
};

/**
 * Count transactions by user ID and category type
 */
export const countTransactionsByUserIdAndType = async (userId, categoryType) => {
  const transactions = await Transaction.find({ 'createdBy._id': userId })
    .populate('categoryId', 'type');

  return transactions.filter(
    (t) => t.categoryId && t.categoryId.type === categoryType
  ).length;
};

/**
 * Update transaction by ID
 */
export const updateTransactionById = async (transactionId, userId, updateData) => {
  return await Transaction.findOneAndUpdate(
    { _id: transactionId, 'createdBy._id': userId },
    updateData,
    { new: true }
  )
    .populate('accountId', 'title icon')
    .populate('categoryId', 'title icon type');
};

/**
 * Delete transaction by ID
 */
export const deleteTransactionById = async (transactionId, userId) => {
  return await Transaction.findOneAndDelete({
    _id: transactionId,
    'createdBy._id': userId,
  });
};

/**
 * Update category snapshot for all transactions with deleted category
 */
export const updateCategorySnapshot = async (categoryId, snapshotName) => {
  return await Transaction.updateMany(
    { categoryId: categoryId },
    { categorySnapshot: snapshotName }
  );
};

/**
 * Update account snapshot for all transactions with deleted account
 */
export const updateAccountSnapshot = async (accountId, snapshotName) => {
  return await Transaction.updateMany(
    { accountId: accountId },
    { accountSnapshot: snapshotName }
  );
};

/**
 * Calculate total amount by category ID for a user
 */
export const getTotalAmountByCategoryId = async (userId, categoryId) => {
  const transactions = await Transaction.find({
    'createdBy._id': userId,
    categoryId: categoryId,
  });

  // Sum all amounts
  const totalAmount = transactions.reduce((sum, transaction) => {
    return sum + (transaction.amount || 0);
  }, 0);

  return totalAmount;
};

/**
 * Calculate total amounts for multiple categories
 */
export const getTotalAmountsByCategoryIds = async (userId, categoryIds) => {
  if (!categoryIds || categoryIds.length === 0) {
    return {};
  }

  const transactions = await Transaction.find({
    'createdBy._id': userId,
    categoryId: { $in: categoryIds },
  });

  // Group by categoryId and sum amounts
  const amountsByCategory = transactions.reduce((acc, transaction) => {
    const categoryId = transaction.categoryId.toString();
    if (!acc[categoryId]) {
      acc[categoryId] = 0;
    }
    acc[categoryId] += transaction.amount || 0;
    return acc;
  }, {});

  return amountsByCategory;
};

