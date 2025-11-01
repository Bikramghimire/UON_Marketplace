# UON Marketplace Database - Standalone Database Prototype

This directory contains the standalone database prototype setup for the UON Marketplace application. This approach allows professors and developers to test the database independently without running the full application.

## 📋 Prerequisites

Before you begin, ensure you have:

1. **PostgreSQL** installed (version 12 or higher)
   - Download from: https://www.postgresql.org/download/
   - Default port: 5432

2. **Node.js** installed (version 14 or higher)
   - Download from: https://nodejs.org/

3. **PostgreSQL Server Running**
   - Make sure PostgreSQL service is running
   - On Windows: Check Services or run `pg_ctl start`
   - On Linux/Mac: `sudo systemctl start postgresql`

## 🚀 Quick Start

### Step 1: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` file with your PostgreSQL credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=uon_marketplace
   ```

### Step 2: Initialize Database

Run the initialization script to create the database, schema, and seed data:

```bash
npm run db:init
```

This script will:
- ✅ Create the database if it doesn't exist
- ✅ Create all tables (users, categories, products, product_images)
- ✅ Set up indexes and constraints
- ✅ Insert sample test data

### Step 3: Test Database

Run the standalone test script to verify database functionality:

```bash
npm run db:test
```

This script will:
- ✅ Test database connection
- ✅ Verify all tables exist and have data
- ✅ Run sample queries
- ✅ Test relationships and constraints
- ✅ Display database statistics

## 📊 Database Schema

### Tables Overview

1. **users** - User account information
   - id, username, email, password, first_name, last_name, phone, location, role
   - Created/Updated timestamps

2. **categories** - Product categories
   - id, name, description, icon
   - Links to products

3. **products** - Product listings
   - id, user_id (FK), category_id (FK), title, description, price, condition, location, status, views
   - Created/Updated timestamps

4. **product_images** - Product images
   - id, product_id (FK), image_url, is_primary
   - Supports multiple images per product

### Relationships

- `products.user_id` → `users.id` (CASCADE DELETE)
- `products.category_id` → `categories.id` (RESTRICT DELETE)
- `product_images.product_id` → `products.id` (CASCADE DELETE)

## 🧪 Testing the Database

### Method 1: Standalone Test Script (Recommended)

Run the comprehensive test script:

```bash
npm run db:test
```

### Method 2: Using API Endpoints

Start the server:

```bash
npm start
# or
npm run dev
```

Then test using these endpoints:

#### Database Connection Test
```bash
GET http://localhost:5000/api/test
```

#### Table Statistics
```bash
GET http://localhost:5000/api/test/tables
```

#### Database Schema
```bash
GET http://localhost:5000/api/test/schema
```

#### Products Summary
```bash
GET http://localhost:5000/api/test/products-summary
```

#### Relationships Test
```bash
GET http://localhost:5000/api/test/relationships
```

#### Sample Queries
```bash
GET http://localhost:5000/api/test/sample-queries
```

### Method 3: Direct SQL Queries

Connect to PostgreSQL using psql:

```bash
psql -U postgres -d uon_marketplace
```

Example queries:

```sql
-- View all products
SELECT p.id, p.title, p.price, c.name as category, u.username as seller
FROM products p
JOIN categories c ON p.category_id = c.id
JOIN users u ON p.user_id = u.id
WHERE p.status = 'active'
LIMIT 10;

-- Count products by category
SELECT c.name, COUNT(p.id) as product_count
FROM categories c
LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
GROUP BY c.name
ORDER BY product_count DESC;

-- View user statistics
SELECT u.username, COUNT(p.id) as products_listed
FROM users u
LEFT JOIN products p ON u.id = p.user_id AND p.status = 'active'
GROUP BY u.id, u.username
ORDER BY products_listed DESC;
```

## 📁 File Structure

```
database/
├── schema.sql          # Database schema (tables, indexes, constraints)
├── seed.sql            # Sample test data
├── init.js             # Database initialization script
├── test-database.js     # Standalone database test script
└── README.md           # This file
```

## 🔧 Maintenance

### Reset Database

To reset the database (drop all data and recreate):

1. Drop the database:
   ```sql
   DROP DATABASE uon_marketplace;
   ```

2. Run initialization again:
   ```bash
   npm run db:init
   ```

### Backup Database

To backup the database:

```bash
pg_dump -U postgres -d uon_marketplace > backup.sql
```

### Restore Database

To restore from backup:

```bash
psql -U postgres -d uon_marketplace < backup.sql
```

## 🐛 Troubleshooting

### Connection Issues

**Error: "connect ECONNREFUSED"**
- Check if PostgreSQL service is running
- Verify DB_HOST and DB_PORT in .env file
- Check firewall settings

**Error: "password authentication failed"**
- Verify DB_USER and DB_PASSWORD in .env file
- Check PostgreSQL authentication settings (pg_hba.conf)

**Error: "database does not exist"**
- Run `npm run db:init` to create the database

### Permission Issues

**Error: "permission denied"**
- Ensure PostgreSQL user has CREATE DATABASE privilege
- Check user permissions in PostgreSQL

### Port Conflicts

**Error: "port 5432 already in use"**
- Change DB_PORT in .env to another port
- Or stop the conflicting service

## 📝 Sample Data

The seed data includes:

- **13 Users** - Mix of regular users and admin
- **6 Categories** - Textbooks, Electronics, Clothing, Furniture, Sports, Services
- **20 Products** - Various products across all categories
- **12 Product Images** - Placeholder image URLs

## 🎯 For Professors Testing

This standalone database prototype allows you to:

1. ✅ Test database structure and relationships
2. ✅ Verify data integrity and constraints
3. ✅ Run queries and test database functionality
4. ✅ Examine schema and indexes
5. ✅ Test CRUD operations independently

### Test Checklist

- [ ] Database connection successful
- [ ] All tables created correctly
- [ ] Sample data loaded successfully
- [ ] Foreign key constraints working
- [ ] Queries execute correctly
- [ ] Relationships properly configured
- [ ] Indexes improve query performance
- [ ] Timestamps update automatically

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the error messages carefully
3. Verify all prerequisites are installed
4. Check PostgreSQL logs for detailed errors

## 📄 License

Part of UON Marketplace project for academic purposes.
