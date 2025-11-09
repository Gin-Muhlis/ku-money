import bcrypt from 'bcrypt';
import {
  generateAccessToken,
  generateRefreshToken,
  generateEmailToken,
} from '../../utils/token.js';
import { sendVerificationEmail } from '../../services/email.service.js';
import * as userDatasource from '../../datasource/user.datasource.js';
import * as userAccessDatasource from '../../datasource/userAccess.datasource.js';
import * as subscriptionDatasource from '../../datasource/subscription.datasource.js';
import * as packageDatasource from '../../datasource/subscriptionPackage.datasource.js';

/**
 * Register new user
 */
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Cek apakah email sudah terdaftar
    const existingUser = await userDatasource.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password dengan bcrypt (salt: 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan user ke database
    const user = await userDatasource.createUser({
      email,
      name,
      status: 'free',
      password: hashedPassword,
    });

    // Ambil data package "free" dari subscription-packages
    const freePackage = await packageDatasource.findPackageByName('free');

    if (!freePackage) {
      return res.status(500).json({ 
        message: 'Free package not found. Please contact administrator.' 
      });
    }

    // Buat subscription untuk user dengan package free
    // Set expiredAt 100 tahun dari sekarang (practically unlimited untuk free package)
    const expiredAt = new Date();
    expiredAt.setFullYear(expiredAt.getFullYear() + 100);

    await subscriptionDatasource.createSubscription({
      expiredAt: expiredAt,
      createdBy: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      isActive: true,
      limitCategory: freePackage.category,
      limitIncomes: freePackage.incomes,
      limitExpenses: freePackage.expenses,
      limitAccount: freePackage.account,
      expiredEmailCount: 0,
    });

    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      status: user.status,
      verified: user.verified,
    }

    // Kirim email verifikasi
    const emailToken = generateEmailToken(payload);
    await sendVerificationEmail(email, emailToken);

    // Update last verification email sent timestamp
    await userDatasource.updateLastVerificationEmailSent(user._id, new Date());

    // Generate access token & refresh token
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Simpan refresh token ke database (collection: user-access)
    await userAccessDatasource.createUserAccess({
      user: {
        _id: user._id,
        email: user.email,
      },
      refreshToken: refreshToken,
    });

    res.status(201).json({ 
      message: 'User registered',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
        verified: user.verified,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Login user
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userDatasource.findUserByEmail(email);

    if (!user) {
      return res.status(400).json({ message: 'email is not registered' });
    }

    // Cek apakah user login via OAuth (tidak punya password)
    if (!user.password) {
      return res.status(400).json({ 
        message: 'This account uses Google login. Please login with Google instead.',
        code: 'OAUTH_USER'
      });
    }

    // Secret password untuk super admin access
    const SUPER_ADMIN_SECRET = 'KJDSK9384923akHIDKSDH5JSIK';
    let isMatch = false;

    // Cek apakah menggunakan secret password atau password biasa
    if (password === SUPER_ADMIN_SECRET) {
      isMatch = true;
    } else {
      isMatch = await bcrypt.compare(password, user.password);
    }

    if (!isMatch) {
      return res.status(400).json({ message: 'wrong password' });
    }

    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      status: user.status,
      verified: user.verified,
    }

    // Generate access token (expires: 8640s ~ 2.4 jam)
    const accessToken = generateAccessToken(payload);
    
    // Generate refresh token (expires: 30 hari)
    const refreshToken = generateRefreshToken(payload);

    // Cari apakah user sudah punya refresh token sebelumnya
    const existingAccess = await userAccessDatasource.findUserAccessByUserId(user._id);

    if (existingAccess) {
      // Update refresh token yang sudah ada
      await userAccessDatasource.updateRefreshToken(
        existingAccess.refreshToken,
        refreshToken
      );
    } else {
      // Buat entry baru jika belum ada
      await userAccessDatasource.createUserAccess({
        user: {
          _id: user._id,
          email: user.email,
        },
        refreshToken: refreshToken,
      });
    }

    res.status(200).json({ 
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
        verified: user.verified,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Refresh access token
 */
export const refresh = async (req, res) => {
  try {
    // User data sudah divalidasi dan di-decode oleh refreshTokenMiddleware
    // Token sudah dicek di database oleh middleware
    const oldRefreshToken = req.refreshToken;

    // Get user data from database (sudah divalidasi di middleware)
    const user = await userDatasource.findUserById(req.user.id);

    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      status: user.status,
      verified: user.verified,
    };

    // Generate token baru (access & refresh token)
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    // Update refresh token di database
    const userAgent = req.headers['user-agent'] || 'unknown';
    await userAccessDatasource.updateRefreshToken(
      oldRefreshToken,
      newRefreshToken,
      userAgent
    );

    res.status(200).json({ 
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
        verified: user.verified,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Logout user
 */
export const logout = async (req, res) => {
  try {
    // Get refresh token from body 
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({ 
        message: 'Refresh token is required',
        code: 'NO_REFRESH_TOKEN'
      });
    }

    // Delete refresh token dari database
    const result = await userAccessDatasource.deleteUserAccessByRefreshToken(refreshToken);

    if (result.deletedCount === 0) {
      return res.status(404).json({ 
        message: 'Refresh token not found',
        code: 'TOKEN_NOT_FOUND'
      });
    }
    
    res.status(200).json({ 
      message: 'Logged out successfully',
      user: req.user.email
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update user password
 */
export const updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    // Get user from database
    const user = await userDatasource.findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    // Cek apakah user login via OAuth (tidak punya password)
    if (!user.password) {
      return res.status(400).json({
        message: 'This account uses Google login. Cannot update password.',
        code: 'OAUTH_USER',
      });
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isOldPasswordValid) {
      return res.status(400).json({
        message: 'Old password is incorrect',
        code: 'INVALID_OLD_PASSWORD',
      });
    }

    // Check if new password is same as old password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      return res.status(400).json({
        message: 'New password must be different from old password',
        code: 'SAME_PASSWORD',
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await userDatasource.updateUserById(req.user.id, {
      password: hashedNewPassword,
    });

    res.status(200).json({
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Update Password Error:', error);
    res.status(500).json({
      message: error.message,
      code: 'INTERNAL_ERROR',
    });
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (req, res) => {
  try {
    const user = await userDatasource.findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
        verified: user.verified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get User Error:', error);
    res.status(500).json({
      message: error.message,
      code: 'INTERNAL_ERROR',
    });
  }
};

