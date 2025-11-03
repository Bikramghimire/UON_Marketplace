# UON Marketplace - Setup Guide

This guide will help you set up and run the UON Marketplace application with MongoDB backend.

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
2. **MongoDB** - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (cloud)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   - Copy `env.example.txt` to `.env`:
     ```bash
     # On Windows (PowerShell)
     Copy-Item env.example.txt .env
     
     # On Linux/Mac
     cp env.example.txt .env
     ```

4. **Update `.env` with your MongoDB connection:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/uon_marketplace
   JWT_SECRET=your-secret-key-change-this-in-production
   ```
   
   **For MongoDB Atlas (cloud):**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/uon_marketplace
   ```

5. **Start MongoDB** (if using local MongoDB):
   ```bash
   # Windows - MongoDB usually runs as a service
   # Check Services app or start manually
   
   # Linux/Mac
   mongod
   ```

6. **Seed the database** (optional - creates sample data):
   ```bash
   npm run seed
   ```
   
   This creates:
   - 4 categories (Textbooks, Electronics, Clothing, Furniture)
   - 4 test users (password: `password123`)
   - 8 sample products

7. **Start the backend server:**
   ```bash
   npm run dev
   ```
   
   The server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file** (optional - uses defaults if not present):
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start the frontend:**
   ```bash
   npm start
   ```
   
   The frontend will run on `http://localhost:3000`

## 📝 Test Accounts

After running `npm run seed`, you can use these test accounts:

- **Email:** `john@example.com` | **Password:** `password123`
- **Email:** `sarah@example.com` | **Password:** `password123`
- **Email:** `mike@example.com` | **Password:** `password123`
- **Email:** `emily@example.com` | **Password:** `password123`

## 🔧 Troubleshooting

### MongoDB Connection Issues

**Error:** `MongoServerError: connect ECONNREFUSED`

**Solutions:**
1. Make sure MongoDB is running:
   - Windows: Check Services app or run `mongod`
   - Linux/Mac: `sudo systemctl start mongod` or `mongod`

2. Verify your MongoDB URI in `.env` file

3. Check MongoDB port (default: 27017)

### Backend Not Starting

**Error:** `Cannot find module`

**Solution:**
```bash
cd backend
npm install
```

### Frontend Not Connecting to Backend

**Error:** `Failed to fetch` or CORS error

**Solutions:**
1. Make sure backend is running on port 5000
2. Check `FRONTEND_URL` in backend `.env` matches your frontend URL
3. Check `REACT_APP_API_URL` in frontend `.env`

### Database Empty

**Solution:**
```bash
cd backend
npm run seed
```

## 📁 Project Structure

```
uon_marketplace/
├── backend/
│   ├── config/          # Database configuration
│   ├── models/          # MongoDB models (User, Product, Category)
│   ├── routes/          # API routes (auth, products, categories)
│   ├── middleware/      # Authentication middleware
│   ├── scripts/         # Database seeding script
│   ├── server.js        # Express server
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/   # React components
    │   ├── pages/       # Page components
    │   ├── services/    # API services
    │   └── context/     # React Context
    └── package.json
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Products
- `GET /api/products` - Get all products (supports filters)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (protected)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category

## 🎯 Next Steps

1. ✅ Backend running on port 5000
2. ✅ Frontend running on port 3000
3. ✅ MongoDB connected
4. ✅ Database seeded with sample data

**You're all set!** Visit `http://localhost:3000` to see your marketplace.

