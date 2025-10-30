import Subscription from '../models/Subscription.model.js';

/**
 * Find active subscription by user ID
 */
export const findActiveSubscriptionByUserId = async (userId) => {
  return await Subscription.findOne({
    'createdBy._id': userId,
    isActive: true,
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
    updateData
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

