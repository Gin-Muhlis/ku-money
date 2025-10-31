import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderType: {
      type: String,
      required: true,
      enum: ['extends', 'upgrade'],
    },
    subscriptionPackage: {
      type: String,
      required: true,
      enum: ['free', 'pro', 'unlimited'],
    },
    amount: {
      type: Number,
      required: true,
    },
    packagePrice: {
      type: Number,
      required: true,
    },
    expiredPaymentAt: {
      type: Date,
      required: true,
    },
    createdBy: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },
    period: {
      type: {
        type: String,
        enum: ['month'],
        default: 'month',
      },
      value: {
        type: Number,
        enum: [1, 3, 6, 12],
        required: true,
      },
    },
    paymentDetail: {
      subscriptionId: {
        type: String,
        default: null,
      },
      paymentMethod: {
        type: String,
        default: null,
      },
      status: {
        type: String,
        enum: ['unpaid', 'paid', 'failed', 'expired', 'cancelled'],
        default: 'unpaid',
      },
      transactionId: {
        type: String,
        default: null,
      },
      detailRequest: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },
    },
    paymentHistory: [
      {
        type: {
          type: String,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        paidAt: {
          type: Date,
          required: true,
        },
        additionalInfo: {
          type: mongoose.Schema.Types.Mixed,
          default: null,
        },
      },
    ],
  },
  { timestamps: true }
);

// Index untuk mempercepat pencarian
orderSchema.index({ 'createdBy._id': 1 });
orderSchema.index({ 'paymentDetail.status': 1 });
orderSchema.index({ 'paymentDetail.transactionId': 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;

