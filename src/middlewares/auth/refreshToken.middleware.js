import UserAccess from '../../models/UserAccess.model.js';
import User from '../../models/User.model.js';

export const refreshTokenMiddleware = async (req, res, next) => {
  try {
    // Get refresh token from body
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ 
        message: 'Refresh token is required',
        code: 'NO_REFRESH_TOKEN'
      });
    }

    // Cek token di database (collection: user-access)
    const userAccess = await UserAccess.findOne({ refreshToken });

    if (!userAccess) {
      return res.status(403).json({ 
        message: 'Invalid refresh token. Token not found.',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Ambil user dari database berdasarkan user._id
    const user = await User.findById(userAccess.user._id);

    if (!user) {
      return res.status(403).json({ 
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Inject user data to request object
    req.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      status: user.status,
      verified: user.verified,
    };

    // Also keep the refresh token in req for potential reuse in controller
    req.refreshToken = refreshToken;

    next();
  } catch (error) {
    // Handle token expired
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ 
        message: 'Refresh token has expired. Please login again.',
        code: 'REFRESH_TOKEN_EXPIRED'
      });
    }

    // Handle invalid token
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        message: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Handle other errors
    return res.status(403).json({ 
      message: 'Forbidden',
      code: 'FORBIDDEN'
    });
  }
};

