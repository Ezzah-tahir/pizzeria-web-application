// server.js
// Express Server Entry Point 

require('dotenv').config(); // Load .env variables FIRST

const express      = require('express');
const session      = require('express-session');
const MongoStore   = require('connect-mongo');
const cors         = require('cors');
const morgan       = require('morgan');
const path         = require('path');

const connectDB           = require('./config/db');
const authRoutes          = require('./routes/authRoutes');
const orderRoutes         = require('./routes/orderRoutes');
const bookingRoutes       = require('./routes/bookingRoutes');
const adminRoutes         = require('./routes/adminRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Connect to MongoDB 
connectDB();

const app = express();

//  CORS Allow frontend (Live Server) to talk to backend 
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://127.0.0.1:5500',
  credentials: true, // Required for cookies/sessions
}));

// Body Parsers 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Request Logger (development only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Session Middleware 
// Sessions are stored in MongoDB (not memory) so they survive server restarts
app.use(
  session({
    secret:            process.env.SESSION_SECRET,
    resave:            false,         // Don't resave if session not modified
    saveUninitialized: false,         // Don't create session until something stored
    store: MongoStore.create({
      mongoUrl:    process.env.MONGO_URI,
      ttl:         60 * 60 * 24 * 7, // Sessions expire in 7 days (seconds)
      autoRemove:  'native',          // MongoDB TTL index handles cleanup
    }),
    cookie: {
      httpOnly: true,                 // JS cannot access cookie (XSS protection)
      secure:   process.env.NODE_ENV === 'production', // HTTPS only in prod
      maxAge:   1000 * 60 * 60 * 24 * 7, // 7 days in milliseconds
      sameSite: 'lax',
    },
  })
);

//Static Files
// Serve uploads folder publicly
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Root route index.html serve karo
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes
app.use('/api/auth',     authRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin',    adminRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: ' The Pizzeria API is running!',
    session: req.session.userId ? 'Active' : 'None',
    env:     process.env.NODE_ENV,
  });
});

//  404 & Global Error Handlers 
app.use(notFound);
app.use(errorHandler);

//  Start Server 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('');
  console.log(' ========================================');
  console.log(`  The Pizzeria API started!`);
  console.log(`  URL:  http://localhost:${PORT}`);
  console.log(`  Mode: ${process.env.NODE_ENV}`);
  console.log(' ========================================');
  console.log('');
});

module.exports = app; // For testing
