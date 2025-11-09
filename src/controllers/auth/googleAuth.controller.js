import { OAuth2Client } from 'google-auth-library';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../../utils/token.js';
import * as userDatasource from '../../datasource/user.datasource.js';
import * as userAccessDatasource from '../../datasource/userAccess.datasource.js';
import * as subscriptionDatasource from '../../datasource/subscription.datasource.js';
import * as packageDatasource from '../../datasource/subscriptionPackage.datasource.js';

// Initialize Google OAuth client
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
  console.warn('Warning: GOOGLE_CLIENT_ID is not set in environment variables. Google OAuth will not work.');
}

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

/**
 * Verify Google ID token dan login/register user
 */
export const googleLogin = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ 
      message: 'Google ID token is required',
      code: 'NO_ID_TOKEN'
    });
  }

  if (!GOOGLE_CLIENT_ID) {
    return res.status(500).json({ 
      message: 'Google OAuth is not configured. Please contact administrator.',
      code: 'OAUTH_NOT_CONFIGURED'
    });
  }

  try {
    // Verify Google ID token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ 
        message: 'Email not found in Google account',
        code: 'NO_EMAIL'
      });
    }

    // Cek apakah user sudah ada
    let user = await userDatasource.findUserByEmail(email);

    if (!user) {
      // User belum ada, buat user baru
      // Untuk OAuth, password tidak diperlukan
      user = await userDatasource.createUser({
        email,
        name,
        status: 'free',
        verified: true, // User Google sudah verified
        password: null, // Tidak ada password untuk OAuth user
      });

      // Ambil data package "free" dari subscription-packages
      const freePackage = await packageDatasource.findPackageByName('free');

      if (!freePackage) {
        return res.status(500).json({ 
          message: 'Free package not found. Please contact administrator.' 
        });
      }

      // Buat subscription untuk user dengan package free
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
    }

    // Generate token untuk user (baik yang baru maupun yang sudah ada)
    const tokenPayload = {
      id: user._id,
      name: user.name,
      email: user.email,
      status: user.status,
      verified: user.verified,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

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
      message: user.password === null ? 'User registered and logged in via Google' : 'User logged in via Google',
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
    console.error('Google Auth Error:', error);
    
    // Handle specific Google OAuth errors
    if (error.message && error.message.includes('Token used too early')) {
      return res.status(400).json({ 
        message: 'Invalid Google token',
        code: 'INVALID_TOKEN'
      });
    }

    res.status(500).json({ 
      message: error.message || 'Failed to authenticate with Google',
      code: 'GOOGLE_AUTH_ERROR'
    });
  }
};

