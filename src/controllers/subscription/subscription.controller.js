import * as subscriptionDatasource from '../../datasource/subscription.datasource.js';

/**
 * Get current user subscription
 */
export const getUserSubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    // Cari subscription aktif user
    const subscription = await subscriptionDatasource.findActiveSubscriptionByUserId(userId);

    if (!subscription) {
      return res.status(404).json({
        message: 'No active subscription found',
        code: 'NO_SUBSCRIPTION',
      });
    }

    res.status(200).json({
      subscription: {
        id: subscription._id,
        expiredAt: subscription.expiredAt,
        isActive: subscription.isActive,
        limitCategory: subscription.limitCategory,
        limitIncomes: subscription.limitIncomes,
        limitExpenses: subscription.limitExpenses,
        limitAccount: subscription.limitAccount,
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get User Subscription Error:', error);
    res.status(500).json({
      message: error.message,
      code: 'INTERNAL_ERROR',
    });
  }
};

