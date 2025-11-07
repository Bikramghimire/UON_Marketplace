# UON Marketplace - Setup Guide

This guide will help you set up and run the UON Marketplace application with PostgreSQL backend.

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
2. **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)

### PostgreSQL Installation

#### Windows
1. Download PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run the installer
3. **Remember the password** you set for the `postgres` user
4. Default port: `5432`

#### macOS
```bash
brew install postgresql@15
brew services start postgresql@15
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create PostgreSQL database:**
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE uon_marketplace;
   
   # Exit PostgreSQL
   \q
   ```

4. **Create `.env` file:**
   - Copy `env.example.txt` to `.env`:
     ```bash
     # On Windows (PowerShell)
     Copy-Item env.example.txt .env
     
     # On Linux/Mac
     cp env.example.txt .env
     ```

5. **Update `.env` with your PostgreSQL credentials:**
   ```env
   # PostgreSQL Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=uon_marketplace
   DB_USER=postgres
   DB_PASSWORD=your-actual-postgres-password
   
   # JWT Secret
   JWT_SECRET=your-secret-key-change-this-in-production
   ```
   
   **Important:** Replace `your-actual-postgres-password` with the password you set during PostgreSQL installation.

6. **Run database migration** (creates all tables):
   ```bash
   npm run migrate
   ```
   
   You should see:
   ```
   ✅ PostgreSQL Connected successfully
   ✅ All models synchronized successfully
   ✅ Migration completed successfully!
   ```

7. **Seed the database** (optional - creates sample data):
   ```bash
   npm run seed
   ```
   
   This creates:
   - 4 categories (Textbooks, Electronics, Clothing, Furniture)
   - 5 test users (password: `password123`)
   - 8 sample products

8. **Create admin user** (optional):
   ```bash
   npm run create-admin
   ```
   
   Creates admin account:
   - Email: `admin@uon.edu`
   - Password: `admin123`

9. **Start the backend server:**
   ```bash
   npm run dev
   ```
   
   The server will run on `http://localhost:5000`
   
   You should see:
   ```
   ✅ PostgreSQL Connected successfully
   🚀 Server running on port 5000
   📱 API available at http://localhost:5000
   🌐 Frontend URL: http://localhost:3000
   💾 Database: PostgreSQL
   ```

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

- **Email:** `admin@uon.edu` | **Password:** `admin123` (Admin account)
- **Email:** `john@example.com` | **Password:** `password123`
- **Email:** `sarah@example.com` | **Password:** `password123`
- **Email:** `mike@example.com` | **Password:** `password123`
- **Email:** `emily@example.com` | **Password:** `password123`

## 🔧 Troubleshooting

### PostgreSQL Connection Issues

**Error:** `Connection refused` or `Cannot connect to database`

**Solutions:**
1. **Check if PostgreSQL is running:**
   - Windows: Open Services app (Win+R, type `services.msc`), look for "postgresql"
   - macOS: `brew services list` (should show postgresql@15 as started)
   - Linux: `sudo systemctl status postgresql`

2. **Start PostgreSQL if not running:**
   - Windows: Start service from Services app
   - macOS: `brew services start postgresql@15`
   - Linux: `sudo systemctl start postgresql`

3. **Verify database exists:**
   ```bash
   psql -U postgres -l
   ```
   Look for `uon_marketplace` in the list

4. **Test connection manually:**
   ```bash
   psql -h localhost -U postgres -d uon_marketplace
   ```

5. **Check `.env` file credentials:**
   - Verify `DB_PASSWORD` matches your PostgreSQL password
   - Check `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`

### Database Tables Not Created

**Error:** Tables don't exist or migration fails

**Solutions:**
1. **Run migration again:**
   ```bash
   npm run migrate
   ```

2. **Check database connection:**
   - Verify database exists: `CREATE DATABASE uon_marketplace;`
   - Test connection: `psql -U postgres -d uon_marketplace`

3. **Check PostgreSQL user permissions:**
   ```sql
   -- In psql
   GRANT ALL PRIVILEGES ON DATABASE uon_marketplace TO postgres;
   ```

### Password Authentication Failed

**Error:** `password authentication failed for user "postgres"`

**Solutions:**
1. **Reset PostgreSQL password:**
   ```sql
   -- Connect as postgres user
   psql -U postgres
   
   -- Change password
   ALTER USER postgres PASSWORD 'newpassword';
   ```
   Then update your `.env` file

2. **Or create a new user:**
   ```sql
   CREATE USER marketplace_user WITH PASSWORD 'yourpassword';
   GRANT ALL PRIVILEGES ON DATABASE uon_marketplace TO marketplace_user;
   ```

### Backend Not Starting

**Error:** `Cannot find module` or dependency errors

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

### Port Already in Use

**Error:** `Port 5432 already in use`

**Solutions:**
1. Stop the other PostgreSQL instance, or
2. Change the port in `.env`:
   ```env
   DB_PORT=5433
   ```

## 📊 Viewing Database in pgAdmin

1. **Open pgAdmin** (download from [pgadmin.org](https://www.pgadmin.org/) if not installed)

2. **Connect to PostgreSQL server:**
   - Right-click "Servers" → "Create" → "Server"
   - General tab: Name = "PostgreSQL"
   - Connection tab:
     - Host: `localhost`
     - Port: `5432`
     - Username: `postgres`
     - Password: Your PostgreSQL password

3. **Navigate to your tables:**
   - Expand: `Servers > PostgreSQL > Databases > uon_marketplace > Schemas > public > Tables`
   - You'll see: `users`, `categories`, `products`, `messages`

4. **View table data:**
   - Right-click a table → "View/Edit Data" → "All Rows"

## 📁 Project Structure

```
uon_marketplace/
├── backend/
│   ├── config/          # Database & Cloudinary configuration
│   ├── models/          # Sequelize models (User, Product, Category, Message)
│   ├── routes/          # API routes (auth, products, categories, messages, admin)
│   ├── middleware/      # Authentication & upload middleware
│   ├── scripts/         # Migration, seeding, and admin scripts
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
- `GET /api/products/my` - Get current user's products (protected)
- `POST /api/products` - Create product (protected)
- `PUT /api/products/:id/status` - Update product status (protected)
- `DELETE /api/products/:id` - Delete product (protected)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category

### Messages
- `GET /api/messages` - Get all conversations (protected)
- `GET /api/messages/conversation/:userId` - Get conversation with user (protected)
- `POST /api/messages` - Send message (protected)
- `GET /api/messages/unread-count` - Get unread count (protected)

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics (admin only)
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/products` - Get all products (admin only)

## 🎯 Next Steps

1. ✅ PostgreSQL installed and running
2. ✅ Database created (`uon_marketplace`)
3. ✅ Backend dependencies installed
4. ✅ Database migration completed
5. ✅ Backend running on port 5000
6. ✅ Frontend running on port 3000
7. ✅ Database seeded with sample data (optional)

**You're all set!** Visit `http://localhost:3000` to see your marketplace.

## 💡 Quick Reference Commands

```bash
# PostgreSQL commands
psql -U postgres                    # Connect to PostgreSQL
CREATE DATABASE uon_marketplace;    # Create database
\l                                  # List all databases
\c uon_marketplace                  # Connect to database
\dt                                 # List all tables
\d users                            # View table structure
\q                                  # Exit PostgreSQL

# Backend commands
npm install                         # Install dependencies
npm run migrate                     # Create database tables
npm run seed                        # Seed sample data
npm run create-admin                # Create admin user
npm run dev                         # Start development server
npm start                           # Start production server
```
