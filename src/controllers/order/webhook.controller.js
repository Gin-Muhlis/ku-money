import { verifyCallbackToken } from '../../services/xendit.service.js';
import * as orderDatasource from '../../datasource/order.datasource.js';
import * as subscriptionDatasource from '../../datasource/subscription.datasource.js';
import * as packageDatasource from '../../datasource/subscriptionPackage.datasource.js';
import * as userDatasource from '../../datasource/user.datasource.js';

/**
 * Webhook handler untuk payment notification dari Xendit
 */
export const xenditWebhook = async (req, res) => {
  try {
    // Verify callback token dari Xendit
    const callbackToken = req.headers['x-callback-token'];
    
    if (!verifyCallbackToken(callbackToken)) {
      console.error('Invalid callback token from Xendit');
      return res.status(401).json({ 
        message: 'Unauthorized - Invalid callback token' 
      });
    }

    const webhookData = req.body;
    console.log('Xendit Webhook Received:', JSON.stringify(webhookData, null, 2));

    // Extract data dari webhook
    const {
      external_id: transactionId,
      status,
      amount,
      paid_amount,
      payment_method,
      paid_at,
      id: invoiceId,
    } = webhookData;

    // Cari order berdasarkan transactionId
    const order = await orderDatasource.findOrderByTransactionId(transactionId);

    if (!order) {
      console.error('Order not found for transactionId:', transactionId);
      return res.status(404).json({ 
        message: 'Order not found' 
      });
    }

    // Update payment detail
    await orderDatasource.updateOrderById(order._id, {
      'paymentDetail.status': status === 'PAID' ? 'paid' : status.toLowerCase(),
      'paymentDetail.paymentMethod': payment_method || 'xendit',
      'paymentDetail.detailRequest.webhookData': webhookData,
    });

    // Jika status PAID, proses payment
    if (status === 'PAID') {
      // Add to payment history
      await orderDatasource.addPaymentHistory(order._id, {
        type: 'payment',
        amount: paid_amount || amount,
        paidAt: paid_at ? new Date(paid_at) : new Date(),
        additionalInfo: {
          paymentMethod: payment_method,
          invoiceId: invoiceId,
        },
      });

      // Update atau create subscription
      const updatedOrder = await orderDatasource.findOrderByTransactionId(transactionId);
      await updateUserSubscription(updatedOrder);

      console.log('Payment successful for transactionId:', transactionId);
    } else if (status === 'EXPIRED') {
      console.log('Payment expired for transactionId:', transactionId);
    } else {
      console.log('Payment status updated:', status);
    }

    // Response to Xendit (harus 200 OK)
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Xendit Webhook Error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

/**
 * Helper function: Update user subscription setelah payment berhasil
 */
export const updateUserSubscription = async (order) => {
  try {
    const userId = order.createdBy._id;
    const packageName = order.subscriptionPackage;
    const periodValue = order.period.value;

    // Ambil data package untuk limit
    const packageData = await packageDatasource.findPackageByName(packageName);

    if (!packageData) {
      console.error('Package data not found:', packageName);
      return;
    }

    // Cari subscription aktif user
    const existingSubscription = await subscriptionDatasource.findActiveSubscriptionByUserId(userId);

    // Hitung expired date baru (dari sekarang + period bulan)
    const now = new Date();
    const newExpiredAt = new Date(now);
    newExpiredAt.setMonth(newExpiredAt.getMonth() + periodValue);

    if (existingSubscription) {
      // Jika sudah ada subscription yang belum expired, extend dari expired date yang ada
      let updatedExpiredAt;
      if (existingSubscription.expiredAt > now) {
        const extendFrom = new Date(existingSubscription.expiredAt);
        extendFrom.setMonth(extendFrom.getMonth() + periodValue);
        updatedExpiredAt = extendFrom;
      } else {
        updatedExpiredAt = newExpiredAt;
      }

      // Update subscription
      await subscriptionDatasource.updateSubscription(existingSubscription._id, {
        expiredAt: updatedExpiredAt,
        limitCategory: packageData.category,
        limitIncomes: packageData.incomes,
        limitExpenses: packageData.expenses,
        limitAccount: packageData.account,
        isActive: true,
      });

      console.log('Subscription updated for user:', userId);
    } else {
      // Buat subscription baru
      await subscriptionDatasource.createSubscription({
        expiredAt: newExpiredAt,
        createdBy: {
          _id: order.createdBy._id,
          name: order.createdBy.name,
          email: order.createdBy.email,
        },
        isActive: true,
        limitCategory: packageData.category,
        limitIncomes: packageData.incomes,
        limitExpenses: packageData.expenses,
        limitAccount: packageData.account,
      });
      console.log('Subscription created for user:', userId);
    }

    // Update user status
    await userDatasource.updateUserStatus(userId, packageName);
    console.log('User status updated to:', packageName);
  } catch (error) {
    console.error('Update Subscription Error:', error);
    throw error;
  }
};

