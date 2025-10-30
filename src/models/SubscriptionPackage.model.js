import mongoose from 'mongoose';

const subscriptionPackageSchema = new mongoose.Schema(
  {
    package: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: Number,
      required: true,
    },
    account: {
      type: Number,
      required: true,
    },
    incomes: {
      type: Number,
      required: true,
    },
    expenses: {
      type: Number,
      required: true,
    },
    operation: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const SubscriptionPackage = mongoose.model('subscription-packages', subscriptionPackageSchema, 'subscription-packages');

export default SubscriptionPackage;

