import User from '../models/User.model.js';

/**
 * Find user by email
 */
export const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

/**
 * Find user by ID
 */
export const findUserById = async (userId) => {
  return await User.findById(userId);
};

/**
 * Create new user
 */
export const createUser = async (userData) => {
  const user = new User(userData);
  return await user.save();
};

/**
 * Update user by ID
 */
export const updateUserById = async (userId, updateData) => {
  return await User.findByIdAndUpdate(userId, updateData, { new: true });
};

/**
 * Update user status
 */
export const updateUserStatus = async (userId, status) => {
  return await User.updateOne({ _id: userId }, { status });
};

/**
 * Update user verification status
 */
export const verifyUser = async (userId) => {
  return await User.updateOne(
    { _id: userId },
    { verified: true }
  );
};

/**
 * Update last verification email sent
 */
export const updateLastVerificationEmailSent = async (userId, timestamp) => {
  return await User.updateOne(
    { _id: userId },
    { lastVerificationEmailSent: timestamp }
  );
};

