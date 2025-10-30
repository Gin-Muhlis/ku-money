import { v4 as uuidv4 } from 'uuid';
import { createInvoice } from '../../services/xendit.service.js';
import * as orderDatasource from '../../datasource/order.datasource.js';
import * as packageDatasource from '../../datasource/subscriptionPackage.datasource.js';

/**
 * Create new order
 */
export const createOrder = async (req, res) => {
  const { packageId, period } = req.body;

  try {
    // Ambil subscription package berdasarkan packageId
    const subscriptionPackage = await packageDatasource.findPackageById(packageId);

    if (!subscriptionPackage) {
      return res.status(404).json({ 
        message: 'Subscription package not found',
        code: 'PACKAGE_NOT_FOUND'
      });
    }

    // Validasi period value
    if (![1, 3, 6, 12].includes(period.value)) {
      return res.status(400).json({ 
        message: 'Invalid period value. Must be 1, 3, 6, or 12',
        code: 'INVALID_PERIOD'
      });
    }

    // Hitung amount = price * period.value
    const packagePrice = subscriptionPackage.price;
    const amount = packagePrice * period.value;

    // Generate transaction ID (unique UUID)
    const transactionId = uuidv4();

    // Mapping data order
    const orderData = {
      subscriptionPackage: subscriptionPackage.package,
      amount: amount,
      packagePrice: packagePrice,
      expiredPaymentAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 jam dari sekarang
      createdBy: {
        _id: req.user.id,
        name: req.user.name,
        email: req.user.email,
      },
      period: {
        type: period.type || 'month',
        value: period.value,
      },
      paymentDetail: {
        subscriptionId: 'ku-money-upgrade',
        paymentMethod: 'xendit',
        status: 'unpaid',
        transactionId: transactionId,
        detailRequest: {
          checkoutUrl: undefined,
        },
      },
      paymentHistory: [],
    };

    // Simpan order ke database
    const order = await orderDatasource.createOrder(orderData);

    // Generate checkout URL dengan Xendit
    let checkoutUrl = null;

    // Jika amount > 0, buat invoice di Xendit
    if (amount > 0) {
      const invoiceResult = await createInvoice({
        transactionId: transactionId,
        amount: amount,
        email: req.user.email,
        description: `KU-Money ${subscriptionPackage.package.toUpperCase()} Subscription - ${period.value} Month${period.value > 1 ? 's' : ''}`,
        successRedirectUrl: `${process.env.CLIENT_URL}/payment/success?transactionId=${transactionId}`,
        failureRedirectUrl: `${process.env.CLIENT_URL}/payment/failed?transactionId=${transactionId}`,
      });

      if (!invoiceResult.success) {
        // Hapus order jika gagal create invoice
        await orderDatasource.deleteOrderById(order._id);
        
        return res.status(500).json({ 
          message: 'Failed to create payment invoice',
          code: invoiceResult.error.code,
          error: invoiceResult.error.message
        });
      }

      checkoutUrl = invoiceResult.data.invoiceUrl;

      // Update order dengan checkout URL
      await orderDatasource.updateOrderById(order._id, {
        'paymentDetail.detailRequest.checkoutUrl': checkoutUrl,
        'paymentDetail.detailRequest.invoiceId': invoiceResult.data.invoiceId,
      });
    }

    res.status(201).json({ 
      transactionId: transactionId,
      checkoutUrl: checkoutUrl,
      amount: amount,
      expiresAt: orderData.expiredPaymentAt,
      package: subscriptionPackage.package,
      period: period.value,
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ 
      message: error.message,
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Get order status by transactionId
 */
export const getOrderStatus = async (req, res) => {
  const { transactionId } = req.params;

  try {
    const order = await orderDatasource.findOrderByTransactionIdAndUserId(
      transactionId,
      req.user.id
    );

    if (!order) {
      return res.status(404).json({ 
        message: 'Order not found',
        code: 'ORDER_NOT_FOUND'
      });
    }

    res.status(200).json({
      transactionId: order.paymentDetail.transactionId,
      status: order.paymentDetail.status,
      package: order.subscriptionPackage,
      amount: order.amount,
      period: order.period.value,
      checkoutUrl: order.paymentDetail.detailRequest?.checkoutUrl,
      expiresAt: order.expiredPaymentAt,
      createdAt: order.createdAt,
      paymentMethod: order.paymentDetail.paymentMethod,
    });
  } catch (error) {
    console.error('Get Order Status Error:', error);
    res.status(500).json({ 
      message: error.message,
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Get all orders for current user
 */
export const getUserOrders = async (req, res) => {
  try {
    const { status, limit = 10, page = 1 } = req.query;

    const skip = (page - 1) * limit;

    const { orders, total } = await orderDatasource.findOrdersByUserId(
      req.user.id,
      { status },
      { limit, skip }
    );

    res.status(200).json({
      orders: orders.map(order => ({
        transactionId: order.paymentDetail.transactionId,
        package: order.subscriptionPackage,
        amount: order.amount,
        period: order.period.value,
        status: order.paymentDetail.status,
        checkoutUrl: order.paymentDetail.detailRequest?.checkoutUrl,
        expiresAt: order.expiredPaymentAt,
        createdAt: order.createdAt,
      })),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get User Orders Error:', error);
    res.status(500).json({ 
      message: error.message,
      code: 'INTERNAL_ERROR'
    });
  }
};

