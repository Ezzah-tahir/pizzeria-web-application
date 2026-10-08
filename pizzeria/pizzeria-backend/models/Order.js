// models/Order.js
// Order Model 

const mongoose = require('mongoose');

// Sub-schema for individual order items
const orderItemSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  price:    { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema(
  {
    // Reference to User 
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
      default: null,
    },

    // Customer info (filled from session or form)
    customerName:  { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    customerEmail: { type: String, trim: true, lowercase: true, default: '' },

    // Order type: delivery / takeout / dine-in
    orderType: {
      type:     String,
      enum:     ['delivery', 'takeout', 'dine-in'],
      required: true,
    },

    deliveryAddress: { type: String, trim: true, default: '' },
    pickupLocation:  { type: String, trim: true, default: '' },

    items: {
      type:     [orderItemSchema],
      required: true,
      validate: {
        validator: (v) => v.length > 0,
        message:   'Order must have at least one item',
      },
    },

    // Computed total (stored for records)
    totalAmount: { type: Number, required: true, min: 0 },

    paymentMethod: {
      type:    String,
      enum:    ['cash', 'card', 'online'],
      default: 'cash',
    },

    status: {
      type:    String,
      enum:    ['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'],
      default: 'pending',
    },

    specialInstructions: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

// Virtual: short order ID for display
orderSchema.virtual('shortId').get(function () {
  return this._id.toString().slice(-6).toUpperCase();
});

module.exports = mongoose.model('Order', orderSchema);
