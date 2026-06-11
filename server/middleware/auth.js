// server/middleware/auth.js
const jwt = require('jsonwebtoken');

/**
 * Verify JWT token and attach user to req
 */
const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please log in.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please log in again.',
      });
    }

    res.status(401).json({
      success: false,
      message: 'Invalid token.',
    });
  }
};

/**
 * Check if user has agent role
 */
const requireAgent = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  if (req.user.role !== 'agent') {
    return res.status(403).json({
      success: false,
      message: 'This action requires agent privileges.',
    });
  }

  next();
};

/**
 * Check if user has customer role
 */
const requireCustomer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  if (req.user.role !== 'customer') {
    return res.status(403).json({
      success: false,
      message: 'This action requires customer privileges.',
    });
  }

  next();
};

module.exports = {
  verifyToken,
  requireAgent,
  requireCustomer,
};