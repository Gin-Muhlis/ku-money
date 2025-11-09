import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['free', 'pro', 'unlimited'],
      default: 'free',
    },
    password: {
      type: String,
      required: false, // Optional untuk user OAuth
    },
    verified: {
      type: Boolean,
      default: false,
    },
    lastVerificationEmailSent: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
