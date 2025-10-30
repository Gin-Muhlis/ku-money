import Order from '../models/Order.model.js';

/**
 * Create new order
 */
export const createOrder = async (orderData) => {
  return await Order.create(orderData);
};

/**
 * Find order by transaction ID
 */
export const findOrderByTransactionId = async (transactionId) => {
  return await Order.findOne({ 'paymentDetail.transactionId': transactionId });
};

/**
 * Find order by transaction ID and user ID
 */
export const findOrderByTransactionIdAndUserId = async (transactionId, userId) => {
  return await Order.findOne({
    'paymentDetail.transactionId': transactionId,
    'createdBy._id': userId,
  });
};

/**
 * Update order by ID
 */
export const updateOrderById = async (orderId, updateData) => {
  return await Order.updateOne({ _id: orderId }, updateData);
};

/**
 * Delete order by ID
 */
export const deleteOrderById = async (orderId) => {
  return await Order.deleteOne({ _id: orderId });
};

/**
 * Find orders by user ID with pagination
 */
export const findOrdersByUserId = async (userId, filters = {}, options = {}) => {
  const { status, limit = 10, skip = 0 } = { ...filters, ...options };
  
  const query = { 'createdBy._id': userId };
  
  if (status) {
    query['paymentDetail.status'] = status;
  }

  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(skip));

  const total = await Order.countDocuments(query);

  return { orders, total };
};

/**
 * Add payment history to order
 */
export const addPaymentHistory = async (orderId, paymentHistoryData) => {
  return await Order.updateOne(
    { _id: orderId },
    { $push: { paymentHistory: paymentHistoryData } }
  );
};

