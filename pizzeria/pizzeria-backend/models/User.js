// models/User.js
// User Model

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, 'Name is required'],
      trim:     true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },

    email: {
      type:     String,
      required: [true, 'Email is required'],
      unique:   true,
      lowercase: true,
      trim:     true,
      match:    [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email'],
    },

    phone: {
      type:  String,
      trim:  true,
      default: '',
    },

    password: {
      type:     String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select:   false, // Never return password in queries by default
    },

    role: {
      type:    String,
      enum:    ['customer', 'admin'],
      default: 'customer',
    },

    loyaltyPoints: {
      type:    Number,
      default: 0,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

//  Pre-save Hook: Hash password before saving 
userSchema.pre('save', async function (next) {
  // Only hash if password was modified (not on other updates)
  if (!this.isModified('password')) return next();

  try {
    const salt     = await bcrypt.genSalt(12); // 12 rounds = good security
    this.password  = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

//  Instance Method: Compare password 
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance Method: Safe user object (no password) 
userSchema.methods.toSafeObject = function () {
  return {
    _id:           this._id,
    name:          this.name,
    email:         this.email,
    phone:         this.phone,
    role:          this.role,
    loyaltyPoints: this.loyaltyPoints,
    createdAt:     this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
