import Subscription from '../models/Subscription.model.js';

/**
 * Find active subscription by user ID
 */
export const findActiveSubscriptionByUserId = async (userId) => {
  return await Subscription.findOne({
    'createdBy._id': userId,
  });
};

/**
 * Create new subscription
 */
export const createSubscription = async (subscriptionData) => {
  return await Subscription.create(subscriptionData);
};

/**
 * Update subscription
 */
export const updateSubscription = async (subscriptionId, updateData) => {
  return await Subscription.updateOne(
    { _id: subscriptionId },
    { $set: updateData }
  );
};

/**
 * Update subscription by user ID
 */
export const updateSubscriptionByUserId = async (userId, updateData) => {
  return await Subscription.updateOne(
    { 'createdBy._id': userId, isActive: true },
    updateData
  );
};

/**
 * Find all subscriptions by user ID
 */
export const findSubscriptionsByUserId = async (userId) => {
  return await Subscription.find({ 'createdBy._id': userId });
};

/**
 * Find subscriptions expiring in 1 day
 */
export const findSubscriptionsExpiringSoon = async () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Set time to start of day
  tomorrow.setHours(0, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(23, 59, 59, 999);
  
  return await Subscription.find({
    isActive: true,
    expiredAt: {
      $gte: tomorrow,
      $lte: tomorrowEnd,
    }
  });
};

/**
 * Find subscriptions that just expired (before today ends)
 * Note: No isActive filter to allow sending emails after subscription becomes inactive
 * Filter by expiredEmailCount < 7 to only get subscriptions that still need emails
 */
export const findJustExpiredSubscriptions = async () => {
  const now = new Date();
  
  return await Subscription.find({
    expiredAt: {
      $lt: now,
    },
    expiredEmailCount: {
      $lt: 7,
    }
  });
};

