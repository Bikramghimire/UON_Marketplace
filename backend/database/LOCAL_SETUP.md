# Local PostgreSQL Database Setup Guide

This guide will help you set up the PostgreSQL database on your local machine for testing.

## 🚀 Quick Setup

### Step 1: Install PostgreSQL

If you haven't installed PostgreSQL yet:

**Windows:**
1. Download from: https://www.postgresql.org/download/windows/
2. Run the installer
3. Remember your postgres user password (or use default)
4. Default port: 5432

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Step 2: Configure Environment

1. Copy the environment file:
   ```bash
   cd backend
   cp env.example .env
   ```

2. Edit `.env` with your PostgreSQL credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   DB_NAME=uon_marketplace
   ```

### Step 3: Run Database Setup

```bash
cd backend
npm run db:setup
```

This will:
- ✅ Create the database
- ✅ Create all tables
- ✅ Set up indexes and constraints
- ✅ Create test users with hashed passwords
- ✅ Create categories
- ✅ Create sample products

## 📊 What Gets Created

### Database
- **Name:** `uon_marketplace`
- **Tables:** users, categories, products, product_images

### Test Users
All test users have the password: **`password123`**

You can login with any of these emails:
- `john.doe@uon.edu`
- `sarah.miller@uon.edu`
- `admin@uon.edu`
- (and 10 more test users)

### Sample Data
- **13 Users** (12 regular + 1 admin)
- **6 Categories** (Textbooks, Electronics, Clothing, Furniture, Sports, Services)
- **20 Products** across all categories

## 🧪 Test the Database

### Option 1: Using the Test Script
```bash
npm run db:test
```

### Option 2: Using API Endpoints
1. Start your server:
   ```bash
   npm start
   ```

2. Test endpoints:
   - `GET http://localhost:5000/api/test` - Database connection
   - `GET http://localhost:5000/api/test/tables` - Table statistics
   - `GET http://localhost:5000/api/products` - Get all products
   - `POST http://localhost:5000/api/auth/login` - Login test

### Option 3: Direct SQL Access
```bash
psql -U postgres -d uon_marketplace
```

Then run:
```sql
-- See all users
SELECT id, username, email FROM users LIMIT 5;

-- See all products
SELECT p.id, p.title, p.price, c.name as category 
FROM products p 
JOIN categories c ON p.category_id = c.id 
LIMIT 5;

-- Check database size
SELECT pg_size_pretty(pg_database_size('uon_marketplace'));
```

## 🔧 Troubleshooting

### Connection Error
**Error:** `ECONNREFUSED` or `connect ECONNREFUSED`

**Solutions:**
1. Check PostgreSQL is running:
   - Windows: Check Services (services.msc)
   - macOS/Linux: `sudo systemctl status postgresql`

2. Verify credentials in `.env` file

3. Check port 5432 is not blocked

### Permission Error
**Error:** `permission denied` or `must be owner`

**Solutions:**
1. Make sure you're using the postgres superuser
2. Or create a user with proper permissions:
   ```sql
   CREATE USER your_user WITH PASSWORD 'your_password';
   ALTER USER your_user CREATEDB;
   ```

### Database Already Exists
**Error:** `database already exists`

**Solution:** 
- The script will continue and use existing database
- Or drop and recreate:
  ```sql
  DROP DATABASE uon_marketplace;
  ```
  Then run `npm run db:setup` again

## 🔄 Reset Database

To reset everything:

```bash
# Drop and recreate
psql -U postgres -c "DROP DATABASE IF EXISTS uon_marketplace;"
npm run db:setup
```

## 📝 Manual Setup (Alternative)

If the automated script doesn't work, you can set up manually:

```bash
# 1. Create database
psql -U postgres -c "CREATE DATABASE uon_marketplace;"

# 2. Run schema
psql -U postgres -d uon_marketplace -f database/schema.sql

# 3. Run seed (will need to hash passwords first)
psql -U postgres -d uon_marketplace -f database/seed.sql
```

## ✅ Verification Checklist

After setup, verify:

- [ ] Database `uon_marketplace` exists
- [ ] All 4 tables created (users, categories, products, product_images)
- [ ] Can connect using: `psql -U postgres -d uon_marketplace`
- [ ] Can login via API with test credentials
- [ ] Products endpoint returns data
- [ ] Test script passes: `npm run db:test`

## 🎯 Next Steps

Once database is set up:

1. **Start backend server:**
   ```bash
   cd backend
   npm start
   ```

2. **Test authentication:**
   - Visit: `http://localhost:5000/api/test`
   - Should see database connection success

3. **Test login:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"john.doe@uon.edu","password":"password123"}'
   ```

4. **Start frontend:**
   ```bash
   cd frontend
   npm start
   ```

## 📞 Need Help?

- Check PostgreSQL logs for errors
- Verify environment variables in `.env`
- Make sure PostgreSQL service is running
- Check firewall settings for port 5432

Your database is now ready for local testing! 🎉
