// middleware/validate.js
// Request Validation Middleware 

const { body, validationResult } = require('express-validator');

/**
 * handleValidationErrors
 * Reads express-validator results and sends a 400 if any errors found.
 * Use this as the LAST middleware in a validation chain array.
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return only the first error message for simplicity
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors:  errors.array(),
    });
  }
  next();
};

// Auth Validators 

const signupValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),

  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) throw new Error('Passwords do not match.');
      return true;
    }),

  handleValidationErrors,
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please enter a valid email address.'),

  body('password')
    .notEmpty().withMessage('Password is required.'),

  handleValidationErrors,
];

//  Order Validator

const orderValidation = [
  body('customerName').trim().notEmpty().withMessage('Customer name is required.'),
  body('customerPhone').trim().notEmpty().withMessage('Phone number is required.'),
  body('orderType')
    .isIn(['delivery', 'takeout', 'dine-in'])
    .withMessage('Invalid order type.'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item.'),
  body('items.*.name').notEmpty().withMessage('Item name is required.'),
  body('items.*.price').isFloat({ min: 0 }).withMessage('Item price must be a positive number.'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Item quantity must be at least 1.'),

  handleValidationErrors,
];

//  Booking Validator 

const bookingValidation = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('phone').trim().notEmpty().withMessage('Phone number is required.'),
  body('date').notEmpty().withMessage('Reservation date is required.')
    .isISO8601().withMessage('Invalid date format.'),
  body('time').notEmpty().withMessage('Reservation time is required.'),
  body('numberOfGuests').optional().isInt({ min: 1, max: 20 })
    .withMessage('Guest count must be between 1 and 20.'),

  handleValidationErrors,
];

module.exports = {
  signupValidation,
  loginValidation,
  orderValidation,
  bookingValidation,
  handleValidationErrors,
};
