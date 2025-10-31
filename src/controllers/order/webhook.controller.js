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
    const orderType = order.orderType;

    // Ambil data package untuk limit
    const packageData = await packageDatasource.findPackageByName(packageName);

    if (!packageData) {
      console.error('Package data not found:', packageName);
      return;
    }

    // Cari subscription aktif user
    const existingSubscription = await subscriptionDatasource.findActiveSubscriptionByUserId(userId);
    // Ambil data user untuk cek status sebelumnya
    const user = await userDatasource.findUserById(userId);
    const now = new Date();

    if (orderType === 'upgrade') {
      // Upgrade: Update limit berdasarkan package + update expiredAt
      let updatedExpiredAt;
      
      // Jika user sebelumnya free, expiredAt dihitung dari sekarang
      // karena free package memiliki expiredAt 100 tahun ke depan
      if (user && user.status === 'free') {
        // Upgrade dari free: expiredAt mulai dari sekarang + period
        updatedExpiredAt = new Date(now);
        updatedExpiredAt.setMonth(updatedExpiredAt.getMonth() + periodValue);
      } else if (existingSubscription && existingSubscription.expiredAt > now) {
        // Jika masih ada subscription aktif (bukan free), extend dari expired date yang ada
        const extendFrom = new Date(existingSubscription.expiredAt);
        extendFrom.setMonth(extendFrom.getMonth() + periodValue);
        updatedExpiredAt = extendFrom;
      } else {
        // Jika tidak ada subscription aktif, mulai dari sekarang
        updatedExpiredAt = new Date(now);
        updatedExpiredAt.setMonth(updatedExpiredAt.getMonth() + periodValue);
      }

      if (existingSubscription) {
        // Update subscription dengan limit baru + expiredAt baru
        await subscriptionDatasource.updateSubscription(existingSubscription._id, {
          expiredAt: updatedExpiredAt,
          limitCategory: packageData.category,
          limitIncomes: packageData.incomes,
          limitExpenses: packageData.expenses,
          limitAccount: packageData.account,
          isActive: true,
        });
        console.log('Subscription upgraded for user:', userId);
      } else {
        // Buat subscription baru
        await subscriptionDatasource.createSubscription({
          expiredAt: updatedExpiredAt,
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
    } else if (orderType === 'extends') {
      // Extends: Hanya update expiredAt, tidak ubah limit
      if (!existingSubscription) {
        console.error('No active subscription found for extends order');
        return;
      }

      // Hitung expired date baru dari expired date yang ada
      let updatedExpiredAt;
      if (existingSubscription.expiredAt > now) {
        // Jika masih aktif, extend dari expired date yang ada
        updatedExpiredAt = new Date(existingSubscription.expiredAt);
        updatedExpiredAt.setMonth(updatedExpiredAt.getMonth() + periodValue);
      } else {
        // Jika sudah expired, mulai dari sekarang
        updatedExpiredAt = new Date(now);
        updatedExpiredAt.setMonth(updatedExpiredAt.getMonth() + periodValue);
      }

      // Update hanya expiredAt, limit tetap sama
      await subscriptionDatasource.updateSubscription(existingSubscription._id, {
        expiredAt: updatedExpiredAt,
        isActive: true,
      });

      console.log('Subscription extended for user:', userId);
    }
  } catch (error) {
    console.error('Update Subscription Error:', error);
    throw error;
  }
};

