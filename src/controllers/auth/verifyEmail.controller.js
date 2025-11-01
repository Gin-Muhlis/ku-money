import { verifyToken, generateEmailToken } from '../../utils/token.js';
import { sendVerificationEmail } from '../../services/email.service.js';
import * as userDatasource from '../../datasource/user.datasource.js';

/**
 * Verify user email
 */
export const verifyEmail = async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = verifyToken(token, process.env.JWT_SECRET);
    const user = await userDatasource.findUserById(decoded.id);

    if (!user) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    if (user.verified) {
      return res.status(200).json({ 
        isVerified: true,
        message: 'Email already verified'
      });
    }

    await userDatasource.verifyUser(user._id);

    res.status(200).json({ 
      isVerified: true,
      message: 'Email verified successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
        verified: true,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Resend verification email
 */
export const resendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await userDatasource.findUserByEmail(email);

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
    await userDatasource.updateLastVerificationEmailSent(user._id, now);

    res.status(200).json({ message: 'Verification email sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

