import UserAccess from '../models/UserAccess.model.js';

/**
 * Create user access (refresh token)
 */
export const createUserAccess = async (userAccessData) => {
  return await UserAccess.create(userAccessData);
};

/**
 * Find user access by user ID
 */
export const findUserAccessByUserId = async (userId) => {
  return await UserAccess.findOne({ 'user._id': userId });
};

/**
 * Find user access by refresh token
 */
export const findUserAccessByRefreshToken = async (refreshToken) => {
  return await UserAccess.findOne({ refreshToken });
};

/**
 * Update refresh token
 */
export const updateRefreshToken = async (oldRefreshToken, newRefreshToken, userAgent = 'unknown') => {
  return await UserAccess.updateOne(
    { refreshToken: oldRefreshToken },
    {
      refreshToken: newRefreshToken,
      'user.userAgent': userAgent,
      updatedAt: new Date(),
    }
  );
};

/**
 * Delete user access by refresh token
 */
export const deleteUserAccessByRefreshToken = async (refreshToken) => {
  return await UserAccess.deleteOne({ refreshToken });
};

