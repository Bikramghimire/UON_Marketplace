# UON Marketplace Backend API

Backend API for UON Marketplace built with Node.js, Express, and MongoDB.

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your MongoDB connection string:
```env
MONGODB_URI=mongodb://localhost:27017/uon_marketplace
JWT_SECRET=your-secret-key-change-this-in-production
```

### Running the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

### Seeding the Database

To populate the database with sample data:

```bash
node scripts/seed.js
```

This will create:
- 4 categories (Textbooks, Electronics, Clothing, Furniture)
- 4 test users (password: `password123`)
- 8 sample products

## 📚 API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Products

- `GET /api/products` - Get all products (supports filters: category, search, minPrice, maxPrice, sortBy)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create a new product (protected)

### Categories

- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create a new category

### Health Check

- `GET /api/health` - Check API status

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-token>
```

## 🗄️ Database Models

### User
- username (unique)
- email (unique)
- password (hashed)
- firstName, lastName
- phone, location
- role (user/admin)

### Category
- name (unique)
- description
- icon

### Product
- title, description
- price, condition
- location, status
- user (reference)
- category (reference)
- images array
- views counter

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Environment Variables:** dotenv

## 📝 Environment Variables

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/uon_marketplace
JWT_SECRET=your-secret-key-change-this-in-production
```

## 🔧 Development

### Project Structure

```
backend/
├── config/
│   └── database.js       # MongoDB connection
├── models/
│   ├── User.js          # User model
│   ├── Category.js      # Category model
│   └── Product.js       # Product model
├── routes/
│   ├── auth.js          # Authentication routes
│   ├── products.js      # Product routes
│   └── categories.js    # Category routes
├── middleware/
│   └── auth.js          # Auth middleware & JWT utilities
├── scripts/
│   └── seed.js          # Database seeding script
├── server.js            # Express server setup
└── package.json
```

## 📖 Example API Calls

### Register User
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Login
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Products
```bash
GET http://localhost:5000/api/products?category=Electronics&sortBy=price-low
```

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running locally or update `MONGODB_URI` in `.env`
- Check MongoDB connection string format

### JWT Error
- Make sure `JWT_SECRET` is set in `.env`
- Verify token is being sent in Authorization header

### CORS Error
- Ensure `FRONTEND_URL` in `.env` matches your frontend URL
- Check CORS configuration in `server.js`

