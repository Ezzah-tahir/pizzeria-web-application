// routes/authRoutes.js
// Authentication Routes 

const express = require('express');
const router  = express.Router();

const {
  signup, login, logout,
  getMe, updateProfile, changePassword, deleteAccount,
} = require('../controllers/authController');

const { isAuthenticated }                       = require('../middleware/auth');
const { signupValidation, loginValidation }     = require('../middleware/validate');

// Public routes
router.post('/signup', signupValidation, signup);
router.post('/login',  loginValidation,  login);
router.post('/logout', logout);

// Protected routes (require session)
router.get('/me',               isAuthenticated, getMe);
router.put('/profile',          isAuthenticated, updateProfile);
router.put('/change-password',  isAuthenticated, changePassword);
router.delete('/account',       isAuthenticated, deleteAccount);

module.exports = router;
