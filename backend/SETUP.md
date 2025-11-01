# UON Marketplace Backend Setup Guide

## 🎯 Quick Start for Professor Testing

This guide will help you set up and test the UON Marketplace database independently.

## 📋 Prerequisites

1. **PostgreSQL** installed and running
   - Version 12 or higher
   - Default port: 5432

2. **Node.js** installed
   - Version 14 or higher

## 🚀 Setup Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy the example environment file and update with your PostgreSQL credentials:

```bash
cp env.example .env
```

Edit `.env` file:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=uon_marketplace
```

### 3. Initialize Database

Run the initialization script:

```bash
npm run db:init
```

This will:
- Create the database
- Create all tables
- Insert sample test data

### 4. Test Database

Run the standalone test script:

```bash
npm run db:test
```

This comprehensive test will verify:
- ✅ Database connection
- ✅ Table structure
- ✅ Sample queries
- ✅ Relationships
- ✅ Data integrity

## 🧪 Testing Options

### Option 1: Standalone Test Script (Recommended)

```bash
npm run db:test
```

### Option 2: API Endpoints

Start the server:

```bash
npm start
```

Then test using:
- `GET http://localhost:5000/api/test` - Database connection test
- `GET http://localhost:5000/api/test/tables` - Table statistics
- `GET http://localhost:5000/api/test/schema` - Database schema
- `GET http://localhost:5000/api/test/products-summary` - Products statistics
- `GET http://localhost:5000/api/test/relationships` - Relationships test

### Option 3: Direct SQL Access

Connect using psql:

```bash
psql -U postgres -d uon_marketplace
```

## 📊 Database Structure

### Tables

1. **users** - User accounts (13 sample users)
2. **categories** - Product categories (6 categories)
3. **products** - Product listings (20 sample products)
4. **product_images** - Product images (12 images)

### Key Features

- ✅ Foreign key constraints
- ✅ Automatic timestamps (created_at, updated_at)
- ✅ Data validation (CHECK constraints)
- ✅ Indexes for performance
- ✅ Soft delete (status field)

## 📁 Important Files

- `database/schema.sql` - Database schema
- `database/seed.sql` - Sample test data
- `database/init.js` - Initialization script
- `database/test-database.js` - Standalone test script
- `database/README.md` - Detailed documentation

## 🎓 For Professors

This standalone database prototype allows you to:

1. **Test Database Structure**
   - Verify schema design
   - Check constraints and relationships
   - Examine indexes

2. **Test Functionality**
   - Run CRUD operations
   - Test queries and filters
   - Verify data integrity

3. **Review Implementation**
   - Clean, well-documented code
   - Proper database design
   - Best practices followed

## ⚠️ Troubleshooting

**Connection Error?**
- Check PostgreSQL is running
- Verify credentials in `.env`
- Check port 5432 is available

**Database Not Found?**
- Run `npm run db:init` first

**Permission Error?**
- Ensure PostgreSQL user has proper permissions
- Check database ownership

## 📞 Need Help?

Check `database/README.md` for detailed documentation and troubleshooting.
