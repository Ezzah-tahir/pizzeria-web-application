// All routes here are protected by isAuthenticated + isAdmin middleware

const User    = require('../models/User');
const Order   = require('../models/Order');
const Booking = require('../models/Booking');

// GET /api/admin/users 
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.json({ success: true, count: users.length, users });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/users/:id 
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

//  PUT /api/admin/users/:id 
const updateUser = async (req, res, next) => {
  try {
    const { name, email, phone, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, role },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.json({ success: true, message: 'User updated.', user });
  } catch (err) {
    next(err);
  }
};

//  DELETE /api/admin/users/:id 
const deleteUser = async (req, res, next) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.session.userId.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.json({ success: true, message: 'User deleted.' });
  } catch (err) {
    next(err);
  }
};

//  GET /api/admin/dashboard 
const getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, totalOrders, totalBookings, recentOrders] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Booking.countDocuments(),
      Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email'),
    ]);

    // Revenue calculation
    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    return res.json({
      success: true,
      stats: { totalUsers, totalOrders, totalBookings, totalRevenue },
      recentOrders,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser, getDashboardStats };
