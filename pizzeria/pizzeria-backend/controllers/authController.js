// controllers/authController.js
const User = require('../models/User');

//  POST /api/auth/signup 
const signup = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if email already in use
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Create new user (password hashed via pre-save hook in User model)
    const user = await User.create({ name, email, phone: phone || '', password });

    // Auto-login: create session
    req.session.userId = user._id;
    req.session.userName = user.name;

    return res.status(201).json({
      success: true,
      message: `Welcome, ${user.name}! Account created successfully.`,
      user:    user.toSafeObject(),
    });
  } catch (err) {
    next(err); // Pass to global error handler
  }
};

// POST /api/auth/login 
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email ,explicitly select password 
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Compare password with stored hash
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Create session
    req.session.userId   = user._id;
    req.session.userName = user.name;

    return res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      user:    user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout 
const logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('connect.sid'); // Clear the session cookie
    return res.json({ success: true, message: 'Logged out successfully.' });
  });
};

// GET /api/auth/me 
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.json({ success: true, user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/profile  (Update own profile) 
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.session.userId,
      { name, phone },
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user:    user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/change-password 
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Provide current password and a new password (min 6 characters).',
      });
    }

    const user = await User.findById(req.session.userId).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = newPassword; // Pre-save hook will hash it
    await user.save();

    return res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    next(err);
  }
};

//DELETE /api/auth/account 
const deleteAccount = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.session.userId);
    req.session.destroy();
    res.clearCookie('connect.sid');
    return res.json({ success: true, message: 'Account deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, logout, getMe, updateProfile, changePassword, deleteAccount };
