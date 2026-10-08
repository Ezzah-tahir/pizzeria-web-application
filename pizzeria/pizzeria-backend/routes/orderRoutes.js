// routes/orderRoutes.js
// Order Routes 

const express = require('express');
const router  = express.Router();

const {
  createOrder, getOrders, getOrderById,
  updateOrder, deleteOrder,
} = require('../controllers/orderController');

const { isAuthenticated, isAdmin } = require('../middleware/auth');
const { orderValidation }          = require('../middleware/validate');

// POST /api/orders  Any logged-in user can place an order
router.post('/', isAuthenticated, orderValidation, createOrder);

// GET /api/orders  Logged-in user sees own orders; admin sees all
router.get('/', isAuthenticated, getOrders);

// GET /api/orders/:id
router.get('/:id', isAuthenticated, getOrderById);

// PUT /api/orders/:id  Admin: change status; user can update special instructions
router.put('/:id', isAuthenticated, updateOrder);

// DELETE /api/orders/:id  Admin only
router.delete('/:id', isAuthenticated, isAdmin, deleteOrder);

module.exports = router;
