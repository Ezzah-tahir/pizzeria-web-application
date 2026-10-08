// controllers/bookingController.js
// Booking Controller (CRUD)

const Booking = require('../models/Booking');
const User    = require('../models/User');

// CREATE: POST /api/bookings
const createBooking = async (req, res, next) => {
  try {
    const { name, phone, email, date, time, numberOfGuests, specialRequests } = req.body;

    // Validate date is in the future
    if (new Date(date) < new Date().setHours(0, 0, 0, 0)) {
      return res.status(400).json({
        success: false,
        message: 'Please select a future date for your reservation.',
      });
    }

    const booking = await Booking.create({
      user:            req.session?.userId || null,
      name,
      phone,
      email:           email           || '',
      date:            new Date(date),
      time,
      numberOfGuests:  numberOfGuests  || 2,
      specialRequests: specialRequests || '',
    });

    return res.status(201).json({
      success: true,
      message: `Table booked for ${numberOfGuests || 2} on ${date} at ${time}!`,
      booking,
    });
  } catch (err) {
    next(err);
  }
};

//  READ ALL: GET /api/bookings
const getBookings = async (req, res, next) => {
  try {
    const requestUser = await User.findById(req.session.userId);
    let filter = {};

    if (requestUser.role !== 'admin') {
      filter.user = req.session.userId;
    }

    const bookings = await Booking.find(filter)
      .populate('user', 'name email')
      .sort({ date: 1 }); // Soonest first

    return res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    next(err);
  }
};

//  READ ONE: GET /api/bookings/:id 
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('user', 'name email');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const requestUser = await User.findById(req.session.userId);
    const isOwner = booking.user && booking.user._id.toString() === req.session.userId.toString();
    if (!isOwner && requestUser.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    return res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};

// UPDATE: PUT /api/bookings/:id 
const updateBooking = async (req, res, next) => {
  try {
    const { date, time, numberOfGuests, specialRequests, status } = req.body;
    const updateData = {};

    if (date)                           updateData.date            = new Date(date);
    if (time)                           updateData.time            = time;
    if (numberOfGuests !== undefined)   updateData.numberOfGuests  = numberOfGuests;
    if (specialRequests !== undefined)  updateData.specialRequests = specialRequests;
    if (status)                         updateData.status          = status;

    const booking = await Booking.findByIdAndUpdate(req.params.id, updateData, {
      new: true, runValidators: true,
    });

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    return res.json({ success: true, message: 'Booking updated.', booking });
  } catch (err) {
    next(err);
  }
};

// DELETE: DELETE /api/bookings/:id 
const deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    return res.json({ success: true, message: 'Booking cancelled successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createBooking, getBookings, getBookingById, updateBooking, deleteBooking };
