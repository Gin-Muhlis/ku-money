import mongoose from 'mongoose';

const userAccessSchema = new mongoose.Schema(
  {
    user: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      email: {
        type: String,
        required: true,
      }
    },
    refreshToken: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

userAccessSchema.index({ refreshToken: 1 });
userAccessSchema.index({ 'user._id': 1 });

const UserAccess = mongoose.model('UserAccess', userAccessSchema);

export default UserAccess;

