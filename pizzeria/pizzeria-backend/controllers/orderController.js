// controllers/orderController.js
// Order Controller (CRUD)

const Order = require('../models/Order');
const User  = require('../models/User');

//Helper: Calculate total from items array 
const calcTotal = (items) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);

//  CREATE: POST /api/orders 
const createOrder = async (req, res, next) => {
  try {
    const {
      customerName, customerPhone, orderType,
      deliveryAddress, pickupLocation,
      items, paymentMethod, specialInstructions,
    } = req.body;

    const totalAmount = calcTotal(items);

    // Attach logged-in user if session exists
    const userId       = req.session?.userId || null;
    const customerEmail = userId
      ? (await User.findById(userId).select('email'))?.email || ''
      : '';

    const order = await Order.create({
      user: userId,
      customerName,
      customerPhone,
      customerEmail,
      orderType,
      deliveryAddress: deliveryAddress || '',
      pickupLocation:  pickupLocation  || '',
      items,
      totalAmount,
      paymentMethod:       paymentMethod       || 'cash',
      specialInstructions: specialInstructions || '',
    });

    // Add loyalty points to user (1 point per dollar)
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $inc: { loyaltyPoints: Math.floor(totalAmount) },
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      orderId: order._id,
      shortId: order._id.toString().slice(-6).toUpperCase(),
      order,
    });
  } catch (err) {
    next(err);
  }
};

//  READ ALL: GET /api/orders  (Admin: all | User: own orders) 
const getOrders = async (req, res, next) => {
  try {
    const user = await User.findById(req.session.userId);
    let filter = {};

    // Customers can only see their own orders
    if (user.role !== 'admin') {
      filter.user = req.session.userId;
    }

    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 }); // Newest first

    return res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    next(err);
  }
};

//  READ ONE: GET /api/orders/:id 
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Only allow owner or admin to view
    const requestUser = await User.findById(req.session.userId);
    const isOwner = order.user && order.user._id.toString() === req.session.userId.toString();
    if (!isOwner && requestUser.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    return res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

//  UPDATE: PUT /api/orders/:id  (Admin: update status) 
const updateOrder = async (req, res, next) => {
  try {
    const { status, specialInstructions } = req.body;
    const updateData = {};
    if (status)               updateData.status               = status;
    if (specialInstructions !== undefined) updateData.specialInstructions = specialInstructions;

    const order = await Order.findByIdAndUpdate(req.params.id, updateData, {
      new:            true,
      runValidators:  true,
    });

    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    return res.json({ success: true, message: 'Order updated.', order });
  } catch (err) {
    next(err);
  }
};

//  DELETE: DELETE /api/orders/:id  (Admin only) 
const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    return res.json({ success: true, message: 'Order deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, getOrders, getOrderById, updateOrder, deleteOrder };
