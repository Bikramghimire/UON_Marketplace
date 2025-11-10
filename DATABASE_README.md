# Database Documentation - UON Marketplace

## 📊 Database System

**Database Type:** PostgreSQL  
**ORM:** Sequelize  
**Version:** PostgreSQL 12+ (recommended)

PostgreSQL is a powerful, open-source relational database management system that provides:
- ACID compliance for data integrity
- Advanced data types (UUID, JSONB, ENUM)
- Full-text search capabilities
- Robust foreign key constraints
- Excellent performance and scalability

## 🔌 Connection Configuration

### Connection Details

The database connection is configured in `backend/config/database.js` using Sequelize ORM.

**Connection Parameters:**
- **Host:** `localhost` (default) or `DB_HOST` from `.env`
- **Port:** `5432` (default) or `DB_PORT` from `.env`
- **Database Name:** `uon_marketplace` (default) or `DB_NAME` from `.env`
- **Username:** `postgres` (default) or `DB_USER` from `.env`
- **Password:** From `DB_PASSWORD` in `.env`

### Connection Pooling

Sequelize uses connection pooling for efficient database connections:

```javascript
pool: {
  max: 5,        // Maximum number of connections
  min: 0,        // Minimum number of connections
  acquire: 30000, // Maximum time to wait for connection (ms)
  idle: 10000    // Maximum time connection can be idle (ms)
}
```

### Environment Variables

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=uon_marketplace
DB_USER=postgres
DB_PASSWORD=your-postgres-password
SYNC_DB=false  # Set to 'true' in development for auto-sync
```

## 📐 Database Schema

### Database Structure

The database consists of **5 main tables**:

1. **users** - User accounts and authentication
2. **categories** - Product categories
3. **products** - Product listings
4. **student_essentials** - Free items shared by students
5. **messages** - User messaging system

### Entity Relationship Diagram

```
users
  ├── hasMany products (user_id)
  ├── hasMany student_essentials (user_id)
  ├── hasMany messages as sender (sender_id)
  └── hasMany messages as recipient (recipient_id)

categories
  ├── hasMany products (category_id)
  └── hasMany student_essentials (category_id)

products
  ├── belongsTo users (user_id)
  ├── belongsTo categories (category_id)
  └── hasMany messages (product_id)

student_essentials
  ├── belongsTo users (user_id)
  ├── belongsTo categories (category_id)
  └── hasMany messages (product_id)

messages
  ├── belongsTo users as sender (sender_id)
  ├── belongsTo users as recipient (recipient_id)
  └── belongsTo products/student_essentials (product_id) [optional]
```

## 📋 Table Structures

### 1. Users Table (`users`)

**Purpose:** Stores user accounts, authentication, and profile information.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | Unique user identifier |
| `username` | VARCHAR(30) | UNIQUE, NOT NULL | Username (3-30 chars, alphanumeric + underscore) |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Email address (validated) |
| `password` | VARCHAR(255) | NOT NULL | Hashed password (bcrypt) |
| `first_name` | VARCHAR(255) | NULL | User's first name |
| `last_name` | VARCHAR(255) | NULL | User's last name |
| `phone` | VARCHAR(255) | NULL | Phone number |
| `location` | VARCHAR(255) | NULL | User location |
| `role` | ENUM('user', 'admin') | NOT NULL, DEFAULT 'user' | User role |
| `email_verified` | BOOLEAN | NOT NULL, DEFAULT false | Email verification status |
| `verification_code` | VARCHAR(6) | NULL | 6-digit email verification code |
| `verification_code_expiry` | TIMESTAMP | NULL | Code expiration time (15 minutes) |
| `verification_token` | VARCHAR(255) | NULL | Legacy verification token |
| `verification_token_expiry` | TIMESTAMP | NULL | Token expiration time |
| `created_at` | TIMESTAMP | NOT NULL | Account creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL | Last update timestamp |

**Indexes:**
- Primary key on `id`
- Unique index on `username`
- Unique index on `email`

**Hooks:**
- `beforeCreate`: Automatically hashes password using bcrypt
- `beforeUpdate`: Re-hashes password if changed

**Methods:**
- `matchPassword(enteredPassword)`: Compares password with hash
- `toJSON()`: Excludes password from JSON output

---

### 2. Categories Table (`categories`)

**Purpose:** Stores product categories for organization.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | Unique category identifier |
| `name` | VARCHAR(255) | UNIQUE, NOT NULL | Category name |
| `description` | TEXT | NULL | Category description |
| `created_at` | TIMESTAMP | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL | Last update timestamp |

**Indexes:**
- Primary key on `id`
- Unique index on `name`

**Relationships:**
- `hasMany` Products

---

### 3. Products Table (`products`)

**Purpose:** Stores product listings created by users.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | Unique product identifier |
| `user_id` | UUID | FOREIGN KEY, NOT NULL | Owner user ID (references users.id) |
| `category_id` | UUID | FOREIGN KEY, NOT NULL | Category ID (references categories.id) |
| `title` | VARCHAR(200) | NOT NULL | Product title (1-200 chars) |
| `description` | TEXT | NOT NULL | Product description |
| `price` | DECIMAL(10, 2) | NOT NULL | Product price (min: 0) |
| `condition` | ENUM | NOT NULL, DEFAULT 'Good' | Product condition: 'New', 'Like New', 'Excellent', 'Good', 'Fair' |
| `location` | VARCHAR(255) | NULL | Product location |
| `status` | ENUM | NOT NULL, DEFAULT 'active' | Status: 'active', 'sold', 'inactive' |
| `images` | JSONB | NULL, DEFAULT [] | Array of image objects |
| `views` | INTEGER | NOT NULL, DEFAULT 0 | View count |
| `created_at` | TIMESTAMP | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL | Last update timestamp |

**Indexes:**
- Primary key on `id`
- Index on `(status, created_at)` - For filtering active products
- Index on `(category_id, status)` - For category filtering
- Index on `user_id` - For user's products

**Foreign Keys:**
- `user_id` → `users.id` (CASCADE on delete)
- `category_id` → `categories.id` (RESTRICT on delete)

**Relationships:**
- `belongsTo` User
- `belongsTo` Category
- `hasMany` Messages

**JSONB Structure (images):**
```json
[
  {
    "url": "https://example.com/image.jpg",
    "isPrimary": true
  },
  {
    "url": "https://example.com/image2.jpg",
    "isPrimary": false
  }
]
```

---

### 4. Student Essentials Table (`student_essentials`)

**Purpose:** Stores free items shared by students (similar to products but without price).

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | Unique student essential identifier |
| `user_id` | UUID | FOREIGN KEY, NOT NULL | Owner user ID (references users.id) |
| `category_id` | UUID | FOREIGN KEY, NOT NULL | Category ID (references categories.id) |
| `title` | VARCHAR(200) | NOT NULL | Item title (1-200 chars) |
| `description` | TEXT | NOT NULL | Item description |
| `condition` | ENUM | NOT NULL, DEFAULT 'Good' | Item condition: 'New', 'Like New', 'Excellent', 'Good', 'Fair' |
| `location` | VARCHAR(255) | NULL | Item location |
| `status` | ENUM | NOT NULL, DEFAULT 'active' | Status: 'active', 'claimed', 'inactive' |
| `images` | JSONB | NULL, DEFAULT [] | Array of image objects |
| `views` | INTEGER | NOT NULL, DEFAULT 0 | View count |
| `created_at` | TIMESTAMP | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL | Last update timestamp |

**Indexes:**
- Primary key on `id`
- Index on `(status, created_at)` - For filtering active items
- Index on `(category_id, status)` - For category filtering
- Index on `user_id` - For user's student essentials

**Foreign Keys:**
- `user_id` → `users.id` (CASCADE on delete)
- `category_id` → `categories.id` (RESTRICT on delete)

**Relationships:**
- `belongsTo` User
- `belongsTo` Category
- `hasMany` Messages

**JSONB Structure (images):**
```json
[
  {
    "url": "https://example.com/image.jpg",
    "isPrimary": true
  },
  {
    "url": "https://example.com/image2.jpg",
    "isPrimary": false
  }
]
```

**Key Differences from Products:**
- No `price` field (all items are free)
- Status uses `'claimed'` instead of `'sold'`
- Otherwise identical structure to products table

---

### 5. Messages Table (`messages`)

**Purpose:** Stores messages between users, including meeting scheduling.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | Unique message identifier |
| `sender_id` | UUID | FOREIGN KEY, NOT NULL | Sender user ID (references users.id) |
| `recipient_id` | UUID | FOREIGN KEY, NOT NULL | Recipient user ID (references users.id) |
| `product_id` | UUID | FOREIGN KEY, NULL | Related product ID (references products.id) |
| `subject` | VARCHAR(200) | NULL | Message subject |
| `content` | TEXT | NOT NULL | Message content |
| `meeting_date` | TIMESTAMP | NULL | Scheduled meeting date |
| `meeting_time` | VARCHAR(255) | NULL | Meeting time |
| `meeting_location_name` | VARCHAR(255) | NULL | Meeting location name |
| `meeting_location_lat` | DECIMAL(10, 8) | NULL | Meeting location latitude |
| `meeting_location_lng` | DECIMAL(11, 8) | NULL | Meeting location longitude |
| `read` | BOOLEAN | NOT NULL, DEFAULT false | Read status |
| `read_at` | TIMESTAMP | NULL | Read timestamp |
| `created_at` | TIMESTAMP | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL | Last update timestamp |

**Indexes:**
- Primary key on `id`
- Index on `(sender_id, recipient_id, created_at)` - For conversation queries
- Index on `(recipient_id, read, created_at)` - For unread messages
- Index on `product_id` - For product-related messages

**Foreign Keys:**
- `sender_id` → `users.id` (CASCADE on delete)
- `recipient_id` → `users.id` (CASCADE on delete)
- `product_id` → `products.id` (SET NULL on delete)

**Relationships:**
- `belongsTo` User (as sender)
- `belongsTo` User (as recipient)
- `belongsTo` Product (optional)

---

## 🔗 Relationships

### One-to-Many Relationships

1. **User → Products**
   - One user can have many products
   - Foreign key: `products.user_id` → `users.id`

2. **User → Messages (as sender)**
   - One user can send many messages
   - Foreign key: `messages.sender_id` → `users.id`

3. **User → Messages (as recipient)**
   - One user can receive many messages
   - Foreign key: `messages.recipient_id` → `users.id`

4. **Category → Products**
   - One category can have many products
   - Foreign key: `products.category_id` → `categories.id`

5. **Product → Messages**
   - One product can have many messages
   - Foreign key: `messages.product_id` → `products.id`

6. **User → Student Essentials**
   - One user can have many student essentials
   - Foreign key: `student_essentials.user_id` → `users.id`

7. **Category → Student Essentials**
   - One category can have many student essentials
   - Foreign key: `student_essentials.category_id` → `categories.id`

8. **Student Essential → Messages**
   - One student essential can have many messages
   - Foreign key: `messages.product_id` → `student_essentials.id` (when referencing student essential)

### Many-to-One Relationships

1. **Product → User**
   - Many products belong to one user
   - Foreign key: `products.user_id` → `users.id`

2. **Product → Category**
   - Many products belong to one category
   - Foreign key: `products.category_id` → `categories.id`

3. **Message → User (sender)**
   - Many messages belong to one sender
   - Foreign key: `messages.sender_id` → `users.id`

4. **Message → User (recipient)**
   - Many messages belong to one recipient
   - Foreign key: `messages.recipient_id` → `users.id`

5. **Message → Product**
   - Many messages can reference one product
   - Foreign key: `messages.product_id` → `products.id` (optional)

6. **Student Essential → User**
   - Many student essentials belong to one user
   - Foreign key: `student_essentials.user_id` → `users.id`

7. **Student Essential → Category**
   - Many student essentials belong to one category
   - Foreign key: `student_essentials.category_id` → `categories.id`

8. **Message → Student Essential**
   - Many messages can reference one student essential
   - Foreign key: `messages.product_id` → `student_essentials.id` (optional, when referencing student essential)

---

## 📊 Data Types Used

### PostgreSQL Data Types

| Sequelize Type | PostgreSQL Type | Usage | Example |
|---------------|----------------|-------|---------|
| `UUID` | `uuid` | Primary keys, Foreign keys | `550e8400-e29b-41d4-a716-446655440000` |
| `STRING` | `varchar(n)` | Text fields with length limit | Username, email, title |
| `STRING(30)` | `varchar(30)` | Fixed length strings | Username |
| `TEXT` | `text` | Unlimited text | Description, message content |
| `INTEGER` | `integer` | Whole numbers | Views count |
| `DECIMAL(10, 2)` | `decimal(10, 2)` | Decimal numbers | Price (e.g., 99.99) |
| `DECIMAL(10, 8)` | `decimal(10, 8)` | Coordinates | Latitude |
| `DECIMAL(11, 8)` | `decimal(11, 8)` | Coordinates | Longitude |
| `BOOLEAN` | `boolean` | True/false values | Email verified, read status |
| `DATE` | `timestamp` | Date and time | Created at, meeting date |
| `ENUM` | `enum` | Predefined values | Role, status, condition |
| `JSONB` | `jsonb` | JSON data | Product images array |

### UUID (Universally Unique Identifier)

All primary keys use UUID v4 for:
- **Security:** Non-sequential IDs prevent enumeration attacks
- **Scalability:** Can generate IDs without database round-trip
- **Uniqueness:** Globally unique across systems

### JSONB (JSON Binary)

Used for `products.images` to store:
- Flexible schema for image arrays
- Fast querying and indexing
- Native PostgreSQL JSON operations

### ENUM Types

1. **User Role:** `'user'`, `'admin'`
2. **Product Status:** `'active'`, `'sold'`, `'inactive'`
3. **Student Essential Status:** `'active'`, `'claimed'`, `'inactive'`
4. **Product/Student Essential Condition:** `'New'`, `'Like New'`, `'Excellent'`, `'Good'`, `'Fair'`

---

## 🔍 Indexes

### Performance Indexes

Indexes are created to optimize common queries:

1. **Users Table:**
   - Primary key on `id`
   - Unique index on `username`
   - Unique index on `email`

2. **Products Table:**
   - Primary key on `id`
   - Index on `(status, created_at)` - Active products sorted by date
   - Index on `(category_id, status)` - Category filtering
   - Index on `user_id` - User's products

3. **Student Essentials Table:**
   - Primary key on `id`
   - Index on `(status, created_at)` - Active items sorted by date
   - Index on `(category_id, status)` - Category filtering
   - Index on `user_id` - User's student essentials

4. **Messages Table:**
   - Primary key on `id`
   - Index on `(sender_id, recipient_id, created_at)` - Conversation queries
   - Index on `(recipient_id, read, created_at)` - Unread messages
   - Index on `product_id` - Product/Student Essential-related messages

5. **Categories Table:**
   - Primary key on `id`
   - Unique index on `name`

---

## 🔐 Security Features

### Password Security

- **Hashing:** Passwords are hashed using bcrypt with salt rounds of 10
- **Never Stored:** Plain text passwords are never stored in the database
- **Auto-Hashing:** Passwords are automatically hashed before save (hooks)

### Data Validation

- **Model Level:** Sequelize validations ensure data integrity
- **Application Level:** Backend routes validate input before database operations
- **Database Level:** Foreign key constraints ensure referential integrity

### Foreign Key Constraints

All foreign keys have appropriate constraints:
- **CASCADE:** Deleting a user deletes their products, student essentials, and messages
- **RESTRICT:** Cannot delete a category with products or student essentials
- **SET NULL:** Deleting a product or student essential sets `product_id` to NULL in messages

---

## 🛠️ Database Operations

### Connection

```javascript
import { connectDB } from './config/database.js';

// Connect to database
await connectDB();
```

### Migration

```bash
# Create/update tables
npm run migrate
```

This runs `sequelize.sync({ alter: true })` which:
- Creates tables if they don't exist
- Updates existing tables to match models
- Preserves existing data

### Seeding

```bash
# Populate database with sample data
npm run seed
```

Creates:
- 4 categories
- 5 test users (password: `password123`)
- 8 sample products
- 3 sample student essentials

### Database Management

```bash
# Truncate all tables (delete data, keep structure)
npm run drop-db

# Drop all tables completely
npm run drop-db:all

# Force drop (no confirmation)
npm run drop-db:force
```

---

## 📊 Database Queries

### Common Query Patterns

#### Find User by Email
```javascript
const user = await User.findOne({
  where: { email: 'user@example.com' }
});
```

#### Find Products by Category
```javascript
const products = await Product.findAll({
  where: { categoryId: categoryId },
  include: [{ model: User, as: 'user' }]
});
```

#### Get User's Messages
```javascript
const messages = await Message.findAll({
  where: {
    [Op.or]: [
      { senderId: userId },
      { recipientId: userId }
    ]
  },
  include: [
    { model: User, as: 'sender' },
    { model: User, as: 'recipient' },
    { model: Product, as: 'product' }
  ],
  order: [['createdAt', 'DESC']]
});
```

#### Get Active Products
```javascript
const products = await Product.findAll({
  where: { status: 'active' },
  include: [
    { model: User, as: 'user' },
    { model: Category, as: 'category' }
  ],
  order: [['createdAt', 'DESC']]
});
```

#### Get Active Student Essentials
```javascript
const essentials = await StudentEssential.findAll({
  where: { status: 'active' },
  include: [
    { model: User, as: 'user' },
    { model: Category, as: 'category' }
  ],
  order: [['createdAt', 'DESC']]
});
```

#### Get User's Student Essentials
```javascript
const essentials = await StudentEssential.findAll({
  where: { userId: userId },
  include: [
    { model: User, as: 'user' },
    { model: Category, as: 'category' }
  ],
  order: [['createdAt', 'DESC']]
});
```

---

## 🔄 Timestamps

All tables include automatic timestamps:
- `created_at` - Set when record is created
- `updated_at` - Automatically updated on record modification

These are managed by Sequelize automatically.

---

## 📝 Naming Conventions

### Table Names
- Plural, lowercase, snake_case
- Examples: `users`, `products`, `categories`, `student_essentials`, `messages`

### Column Names
- Singular, lowercase, snake_case
- Examples: `user_id`, `category_id`, `created_at`, `email_verified`

### Model Names
- Singular, PascalCase
- Examples: `User`, `Product`, `Category`, `StudentEssential`, `Message`

### Field Mapping
Sequelize maps camelCase model properties to snake_case database columns:
- `userId` → `user_id`
- `emailVerified` → `email_verified`
- `createdAt` → `created_at`

---

## 🚀 Best Practices

1. **Always use transactions** for multiple related operations
2. **Use indexes** for frequently queried columns
3. **Validate data** at both application and database level
4. **Use foreign keys** to maintain referential integrity
5. **Never store plain text passwords**
6. **Use UUIDs** for primary keys in distributed systems
7. **Use JSONB** for flexible schema data
8. **Monitor connection pool** usage
9. **Backup regularly** in production
10. **Use migrations** for schema changes

---

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [UUID Specification](https://tools.ietf.org/html/rfc4122)
- [JSONB in PostgreSQL](https://www.postgresql.org/docs/current/datatype-json.html)

---

## 🔧 Troubleshooting

### Connection Issues

**Error:** `Connection refused`
- Check if PostgreSQL is running
- Verify connection parameters in `.env`
- Check firewall settings

**Error:** `password authentication failed`
- Verify `DB_PASSWORD` in `.env`
- Reset PostgreSQL password if needed

### Migration Issues

**Error:** `Table already exists`
- Run `npm run drop-db` to clear tables
- Or use `SYNC_DB=true` for auto-sync

**Error:** `Foreign key constraint fails`
- Ensure referenced records exist
- Check foreign key relationships

### Performance Issues

- Check if indexes are being used
- Monitor connection pool usage
- Optimize queries with `EXPLAIN ANALYZE`

---

## 📞 Support

For database-related issues:
1. Check this documentation
2. Review error messages in console
3. Check PostgreSQL logs
4. Verify `.env` configuration

---

**Last Updated:** 2025-01-07  
**Database Version:** PostgreSQL 12+  
**ORM Version:** Sequelize 6.35.2  
**Total Tables:** 5 (users, categories, products, student_essentials, messages)

