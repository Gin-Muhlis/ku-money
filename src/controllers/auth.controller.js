import bcrypt from 'bcrypt';
import User from '../models/User.model.js';
import {
  generateAccessToken,
  generateRefreshToken,
  generateEmailToken,
  verifyToken,
} from '../utils/token.js';
import { sendVerificationEmail } from '../services/email.service.js';

export const register = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword,
    });

    await user.save();

    const emailToken = generateEmailToken({ id: user._id });
    await sendVerificationEmail(email, emailToken);

    res.status(201).json({ message: 'User registered, please verify email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = verifyToken(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    user.verified = true;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.verified) {
      return res.status(400).json({ message: 'Please verify your email' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken({ id: user._id });
    const refreshToken = generateRefreshToken({ id: user._id });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ accessToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const refresh = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  try {
    const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH);
    const accessToken = generateAccessToken({ id: decoded.id });
    res.status(200).json({ accessToken });
  } catch (error) {
    res.status(403).json({ message: 'Invalid refresh token' });
  }
};

export const logout = (req, res) => {
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logged out successfully' });
};
