A full‑stack web application built as a **semester project** for the Web Technologies course.  
This project simulates an online pizzeria system with **user authentication, order booking, and order management**.



##  Features
- User signup/login with JWT authentication  
- Place and manage pizza orders  
- Booking system for reservations  
- Error handling and validation middleware  
- Responsive frontend with HTML, CSS, and JavaScript
- Data storage in database

---

##  Tech Stack
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  
- **Frontend:** HTML5, CSS3, JavaScript  
- **Other Tools:** JWT, Middleware, REST APIs  

---

##  Project Structure
```
pizzeria-backend/
├── config/          # Database connection
├── controllers/     # Business logic
├── middleware/      # Auth & validation
├── models/          # Mongoose schemas
├── routes/          # API routes
├── public/          # Frontend files (HTML, CSS, JS)
├── .env             # Environment variables (not uploaded)
├── .gitignore       # Ignored files (node_modules, .env)
├── package.json     # Dependencies
└── server.js        # Entry point
```

---

##  Installation & Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/<Ezzah-tahir>/pizzeria-web-application.git
   ```
2. Navigate to backend folder:
   ```bash
   cd pizzeria-project/pizzeria-backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file with:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   PORT=5000
   ```
5. Run the server:
   ```bash
   npm start
   ```

---

##  Screenshots

### Home Page
![Home Page](pizzeria/assets/Home-Page.png)

### Menu Page
![Menu Page](pizzeria/assets/menu.png)

### Signup / Login
![Signup/Login](pizzeria/assets/sign-up_login.png)

### Order Placement & Checkout
![Order Placement](pizzeria/assets/order-placement_and_checkout.png)

### Backend Connection
![Backend Connection](pizzeria/assets/backend-connetion.png)

### Database Connectivity
![Database Connectivity](pizzeria/assets/data_base_connectivity.png)

---

##  Author
- **Ezzah Tahir**  
BS Information Technology, International Islamic University Islamabad  

