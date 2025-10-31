import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    createdBy: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    note: {
      type: String,
      default: '',
      trim: true,
    },
    paymentDate: {
      type: Date,
      required: true,
    },
    categorySnapshot: {
      type: String,
      default: null,
      trim: true,
    },
    accountSnapshot: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { timestamps: true }
);

// Index untuk mempercepat pencarian
transactionSchema.index({ 'createdBy._id': 1 });
transactionSchema.index({ accountId: 1 });
transactionSchema.index({ categoryId: 1 });
transactionSchema.index({ paymentDate: -1 });
transactionSchema.index({ 'createdBy._id': 1, paymentDate: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema, 'transactions');

export default Transaction;

