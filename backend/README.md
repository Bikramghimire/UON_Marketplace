# UON Marketplace Backend API

Backend API for UON Marketplace built with Node.js, Express, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)

### Installation

1. **Install PostgreSQL:**
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - macOS: `brew install postgresql@15`
   - Linux: `sudo apt install postgresql postgresql-contrib`

2. **Create PostgreSQL database:**
   ```sql
   -- Connect to PostgreSQL
   psql -U postgres
   
   -- Create database
   CREATE DATABASE uon_marketplace;
   
   -- Exit
   \q
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Create `.env` file from `.env.example`:**
   ```bash
   cp env.example.txt .env
   ```

5. **Update `.env` with your PostgreSQL credentials:**
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=uon_marketplace
   DB_USER=postgres
   DB_PASSWORD=your-postgres-password
   JWT_SECRET=your-secret-key-change-this-in-production
   ```

6. **Run database migration:**
   ```bash
   npm run migrate
   ```
   This creates all necessary tables in PostgreSQL.

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
npm run seed
```

This will create:
- 4 categories (Textbooks, Electronics, Clothing, Furniture)
- 5 test users (password: `password123`)
- 8 sample products

### Creating Admin User

To create an admin user:

```bash
npm run create-admin
```

This creates:
- Email: `admin@uon.edu`
- Password: `admin123`

## 📚 API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Products

- `GET /api/products` - Get all products (supports filters: category, search, minPrice, maxPrice, sortBy)
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/my` - Get current user's products (protected)
- `POST /api/products` - Create a new product (protected)
- `PUT /api/products/:id/status` - Update product status (protected)
- `DELETE /api/products/:id` - Delete product (protected)

### Categories

- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create a new category

### Messages

- `GET /api/messages` - Get all conversations (protected)
- `GET /api/messages/conversation/:userId` - Get conversation with user (protected)
- `POST /api/messages` - Send a message (protected)
- `GET /api/messages/unread-count` - Get unread message count (protected)
- `PUT /api/messages/:id/read` - Mark message as read (protected)

### Admin

- `GET /api/admin/dashboard` - Get dashboard statistics (admin only)
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/products` - Get all products (admin only)
- `GET /api/admin/categories` - Get all categories (admin only)

### Health Check

- `GET /api/health` - Check API status

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-token>
```

## 🗄️ Database Models

### User
- id (UUID, primary key)
- username (unique)
- email (unique)
- password (hashed with bcrypt)
- firstName, lastName
- phone, location
- role (user/admin)
- createdAt, updatedAt

### Category
- id (UUID, primary key)
- name (unique)
- description
- createdAt, updatedAt

### Product
- id (UUID, primary key)
- title, description
- price (DECIMAL)
- condition (enum: New, Like New, Excellent, Good, Fair)
- location, status (enum: active, sold, inactive)
- userId (foreign key to users)
- categoryId (foreign key to categories)
- images (JSONB array)
- views (integer)
- createdAt, updatedAt

### Message
- id (UUID, primary key)
- senderId (foreign key to users)
- recipientId (foreign key to users)
- productId (foreign key to products, optional)
- subject, content
- meetingDate, meetingTime
- meetingLocationName, meetingLocationLat, meetingLocationLng
- read (boolean)
- readAt (timestamp)
- createdAt, updatedAt

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL with Sequelize ORM
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Environment Variables:** dotenv

## 📝 Environment Variables

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# PostgreSQL Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=uon_marketplace
DB_USER=postgres
DB_PASSWORD=your-postgres-password

# JWT Secret
JWT_SECRET=your-secret-key-change-this-in-production

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Database Sync (set to 'true' in development to auto-sync models)
SYNC_DB=false
```

## 🔧 Development

### Project Structure

```
backend/
├── config/
│   ├── database.js       # PostgreSQL connection with Sequelize
│   └── cloudinary.js     # Cloudinary configuration
├── models/
│   ├── index.js          # Models index with associations
│   ├── User.js           # User model
│   ├── Category.js       # Category model
│   ├── Product.js        # Product model
│   └── Message.js        # Message model
├── routes/
│   ├── auth.js           # Authentication routes
│   ├── products.js       # Product routes
│   ├── categories.js     # Category routes
│   ├── messages.js       # Message routes
│   ├── admin.js          # Admin routes
│   └── upload.js         # File upload routes
├── middleware/
│   ├── auth.js           # Auth middleware & JWT utilities
│   └── upload.js         # File upload middleware
├── scripts/
│   ├── migrate.js        # Database migration script
│   ├── seed.js           # Database seeding script
│   └── create-admin.js   # Create admin user script
├── server.js             # Express server setup
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

### PostgreSQL Connection Error
- Ensure PostgreSQL is running:
  - Windows: Check Services app or run `pg_ctl start`
  - macOS: `brew services start postgresql@15`
  - Linux: `sudo systemctl start postgresql`
- Verify database exists: `psql -U postgres -l`
- Check `.env` file has correct credentials
- Test connection: `psql -h localhost -U postgres -d uon_marketplace`

### Database Tables Not Created
- Run migration: `npm run migrate`
- Check database connection in `.env`
- Verify PostgreSQL is running

### JWT Error
- Make sure `JWT_SECRET` is set in `.env`
- Verify token is being sent in Authorization header

### CORS Error
- Ensure `FRONTEND_URL` in `.env` matches your frontend URL
- Check CORS configuration in `server.js`

### Migration Errors
- Ensure database exists: `CREATE DATABASE uon_marketplace;`
- Check PostgreSQL user has proper permissions
- Verify connection credentials in `.env`

## 📊 Database Management

### Using pgAdmin
1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Navigate to: `Servers > PostgreSQL > Databases > uon_marketplace > Schemas > public > Tables`
4. You'll find: `users`, `categories`, `products`, `messages`

### Using psql Command Line
```bash
# Connect to database
psql -U postgres -d uon_marketplace

# List all tables
\dt

# View table structure
\d users

# View table data
SELECT * FROM users;

# Exit
\q
```

## 🚀 Deployment Notes

- Set `NODE_ENV=production` in production
- Use strong `JWT_SECRET` in production
- Set `SYNC_DB=false` in production (use migrations instead)
- Use connection pooling for better performance
- Enable SSL for PostgreSQL in production
