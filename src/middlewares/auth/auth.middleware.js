import { verifyToken } from '../../utils/token.js';

export const authMiddleware = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ 
        message: 'Access token is required',
        code: 'NO_TOKEN'
      });
    }

    // Check if token is in Bearer format
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Invalid token format. Use Bearer <token>',
        code: 'INVALID_FORMAT'
      });
    }

    // Extract token from Bearer
    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({ 
        message: 'Access token is required',
        code: 'NO_TOKEN'
      });
    }

    // Verify token with JWT_SECRET
    const decoded = verifyToken(token, process.env.JWT_SECRET);

    // Inject user data to request object
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      status: decoded.status,
      verified: decoded.verified,
    };

    next();
  } catch (error) {
    // Handle token expired
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Access token has expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    // Handle invalid token
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid access token',
        code: 'INVALID_TOKEN'
      });
    }

    // Handle other errors
    return res.status(401).json({ 
      message: 'Unauthorized',
      code: 'UNAUTHORIZED'
    });
  }
};

