// routes/adminRoutes.js
// Admin Routes — All protected by isAuthenticated + isAdmin 

const express = require('express');
const router  = express.Router();

const {
  getAllUsers, getUserById, updateUser, deleteUser, getDashboardStats,
} = require('../controllers/adminController');

const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Apply both middleware to ALL admin routes
router.use(isAuthenticated, isAdmin);

router.get('/dashboard', getDashboardStats);

router.get('/users',       getAllUsers);
router.get('/users/:id',   getUserById);
router.put('/users/:id',   updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
