// models/Booking.js
// Table Reservation Model 

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     'User',
      default: null,
    },

    name:  { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, default: '' },

    date: {
      type:     Date,
      required: [true, 'Reservation date is required'],
    },

    time: {
      type:     String,
      required: [true, 'Reservation time is required'],
    },

    numberOfGuests: {
      type:    Number,
      default: 2,
      min:     [1, 'At least 1 guest required'],
      max:     [20, 'Maximum 20 guests per booking'],
    },

    specialRequests: { type: String, trim: true, default: '' },

    status: {
      type:    String,
      enum:    ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
