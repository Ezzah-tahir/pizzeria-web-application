# 🍕 The Pizzeria — Full Stack Web Application

## Tech Stack
- **Frontend:** HTML, CSS, JavaScript (Vanilla)
- **Backend:** Node.js + Express.js
- **Database:** MongoDB (via Mongoose ORM)
- **Session Auth:** express-session + connect-mongo (server-side sessions)
- **Password Security:** bcryptjs (12 salt rounds)
- **Validation:** express-validator (backend) + custom JS (frontend)

---

## 📁 Project Folder Structure

```
pizzeria-backend/
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/
│   ├── authController.js      # Signup, Login, Logout, Profile CRUD
│   ├── orderController.js     # Order CRUD
│   ├── bookingController.js   # Reservation CRUD
│   └── adminController.js     # Admin: Users, Dashboard stats
├── middleware/
│   ├── auth.js                # isAuthenticated, isAdmin, attachUser
│   ├── errorHandler.js        # Global 404 & error handler
│   └── validate.js            # express-validator rules
├── models/
│   ├── User.js                # User schema + password hashing
│   ├── Order.js               # Order schema
│   └── Booking.js             # Booking/Reservation schema
├── routes/
│   ├── authRoutes.js
│   ├── orderRoutes.js
│   ├── bookingRoutes.js
│   └── adminRoutes.js
├── public/
│   ├── script.js              # Updated frontend script (use this!)
│   ├── login-script-update.html   # Replace login.html <script> with this
│   ├── signup-script-update.html  # Replace signup.html <script> with this
│   └── uploads/               # File upload storage
├── .env                       # Environment variables
├── package.json
└── server.js                  # Main entry point
```

---

## ⚙️ Setup Instructions

### 1. Prerequisites
- Node.js v18+ installed
- MongoDB installed and running (MongoDB Compass or `mongod` service)

### 2. Install Dependencies
```bash
cd pizzeria-backend
npm install
```

### 3. Configure Environment
Open `.env` and check:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/pizzeria_db
SESSION_SECRET=pizzeria_super_secret_key_change_in_prod_2024
CLIENT_URL=http://127.0.0.1:5500
```
> `CLIENT_URL` should match the address your frontend runs on (VS Code Live Server default is `127.0.0.1:5500`)

### 4. Start MongoDB
- Open **MongoDB Compass** and connect to `mongodb://localhost:27017`
- The database `pizzeria_db` will be created automatically

### 5. Start the Backend Server
```bash
# Production
npm start

# Development (auto-restart on changes)
npm run dev
```
You should see:
```
✅ MongoDB Connected: localhost
🍕 The Pizzeria API started!
🍕 URL: http://localhost:5000
```

### 6. Update Frontend Files
- **Replace** `script.js` with the new `public/script.js`
- **Replace** the `<script>` tag in `login.html` with content from `public/login-script-update.html`
- **Replace** the `<script>` tag in `signup.html` with content from `public/signup-script-update.html`
- Open your frontend with **VS Code Live Server** (right-click index.html → Open with Live Server)

---

## 🔗 API Endpoints

### Auth Routes — `/api/auth`
| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/signup` | No | Register new user |
| POST | `/login` | No | Login user |
| POST | `/logout` | No | Logout and destroy session |
| GET | `/me` | Yes | Get current logged-in user |
| PUT | `/profile` | Yes | Update name/phone |
| PUT | `/change-password` | Yes | Change password |
| DELETE | `/account` | Yes | Delete own account |

### Order Routes — `/api/orders`
| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/` | Yes | Place new order |
| GET | `/` | Yes | Get orders (own or all if admin) |
| GET | `/:id` | Yes | Get single order |
| PUT | `/:id` | Yes | Update order |
| DELETE | `/:id` | Admin | Delete order |

### Booking Routes — `/api/bookings`
| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/` | Yes | Create reservation |
| GET | `/` | Yes | Get bookings |
| GET | `/:id` | Yes | Get single booking |
| PUT | `/:id` | Yes | Update booking |
| DELETE | `/:id` | Yes | Cancel booking |

### Admin Routes — `/api/admin`
| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/dashboard` | Admin | Stats: users, orders, revenue |
| GET | `/users` | Admin | List all users |
| GET | `/users/:id` | Admin | Get user by ID |
| PUT | `/users/:id` | Admin | Update any user |
| DELETE | `/users/:id` | Admin | Delete a user |

### Health Check
```
GET /api/health
```

---

## 🔒 Security Features
- **bcryptjs** with 12 salt rounds for password hashing
- **express-session** with MongoDB store (sessions survive restarts)
- **httpOnly cookies** (JS cannot steal session cookie)
- **CORS** configured to only allow your frontend origin
- Passwords never returned in API responses (`select: false`)
- Input validation on both frontend AND backend

## 🗄️ CRUD Summary
| Resource | Create | Read | Update | Delete |
|----------|--------|------|--------|--------|
| User | POST /auth/signup | GET /auth/me | PUT /auth/profile | DELETE /auth/account |
| Order | POST /orders | GET /orders | PUT /orders/:id | DELETE /orders/:id |
| Booking | POST /bookings | GET /bookings | PUT /bookings/:id | DELETE /bookings/:id |
| Users (Admin) | — | GET /admin/users | PUT /admin/users/:id | DELETE /admin/users/:id |

---

## 🧪 Test with Postman / Thunder Client

**Sign Up:**
```json
POST http://localhost:5000/api/auth/signup
{
  "name": "Marco Rossi",
  "email": "marco@example.com",
  "password": "pizza123",
  "confirmPassword": "pizza123"
}
```

**Login:**
```json
POST http://localhost:5000/api/auth/login
{
  "email": "marco@example.com",
  "password": "pizza123"
}
```

**Place Order (must be logged in):**
```json
POST http://localhost:5000/api/orders
{
  "customerName": "Marco Rossi",
  "customerPhone": "+1234567890",
  "orderType": "delivery",
  "deliveryAddress": "123 Pizza Street",
  "items": [
    { "name": "Margherita", "price": 12.99, "quantity": 2 },
    { "name": "Tiramisu", "price": 6.99, "quantity": 1 }
  ],
  "paymentMethod": "cash"
}
```

> ⚠️ In Postman, enable **"Send cookies"** or use a cookie jar to maintain session after login.
