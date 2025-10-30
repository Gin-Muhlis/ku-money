import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    expiredAt: {
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
    isActive: {
      type: Boolean,
      default: true,
    },
    limitCategory: {
      type: Number,
      required: true,
    },
    limitIncomes: {
      type: Number,
      required: true,
    },
    limitExpenses: {
      type: Number,
      required: true,
    },
    limitAccount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// Index untuk mempercepat pencarian
subscriptionSchema.index({ 'createdBy._id': 1 });
subscriptionSchema.index({ isActive: 1 });
subscriptionSchema.index({ expiredAt: 1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;

