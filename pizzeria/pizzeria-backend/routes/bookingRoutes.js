// routes/bookingRoutes.js
// Booking / Reservation Routes

const express = require('express');
const router  = express.Router();

const {
  createBooking, getBookings, getBookingById,
  updateBooking, deleteBooking,
} = require('../controllers/bookingController');

const { isAuthenticated, isAdmin } = require('../middleware/auth');
const { bookingValidation }        = require('../middleware/validate');

// POST /api/bookings
router.post('/', isAuthenticated, bookingValidation, createBooking);

// GET /api/bookings
router.get('/', isAuthenticated, getBookings);

// GET /api/bookings/:id
router.get('/:id', isAuthenticated, getBookingById);

// PUT /api/bookings/:id
router.put('/:id', isAuthenticated, updateBooking);

// DELETE /api/bookings/:id
router.delete('/:id', isAuthenticated, deleteBooking);

module.exports = router;
