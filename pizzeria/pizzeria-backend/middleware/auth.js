// middleware/auth.js
// Authentication & Authorization Middleware 

const User = require('../models/User');

/**
 * isAuthenticated
 * Checks if a valid session exists.
 * Attach this to any route that requires login.
 */
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({
    success: false,
    message: 'Please log in to access this resource.',
  });
};

/**
 * isAdmin
 * Must be used AFTER isAuthenticated.
 * Allows only users with role === 'admin'.
 */
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admins only.',
      });
    }
    req.user = user; // Attach full user object to request
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * attachUser
 * Optionally attaches user to req if logged in (for public routes
 * that show different content based on login status).
 */
const attachUser = async (req, res, next) => {
  if (req.session && req.session.userId) {
    try {
      req.user = await User.findById(req.session.userId).select('-password');
    } catch {
      req.user = null;
    }
  }
  next();
};

module.exports = { isAuthenticated, isAdmin, attachUser };
