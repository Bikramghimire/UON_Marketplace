# Where is My Database Stored?

## 📍 PostgreSQL Database Storage Location

PostgreSQL stores your database files in a **data directory** on your computer's filesystem, not in your project folder.

### Database Name
Your database is named: **`uon_marketplace`** (as configured in `.env`)

### How to Find Your PostgreSQL Data Directory

#### **On Windows:**

The default PostgreSQL data directory is typically located at:

```
C:\Program Files\PostgreSQL\{version}\data\
```

Or if installed via EnterpriseDB installer:
```
C:\Program Files\PostgreSQL\{version}\data\
```

Common locations:
- `C:\Program Files\PostgreSQL\15\data\`
- `C:\Program Files\PostgreSQL\14\data\`
- `C:\Program Files\PostgreSQL\13\data\`

#### **To Find Your Exact Data Directory:**

**Method 1: Using SQL Query**
```sql
SHOW data_directory;
```

Run this in psql or pgAdmin:
```bash
psql -U postgres -c "SHOW data_directory;"
```

**Method 2: Check PostgreSQL Service**
1. Open Services (Win + R, type `services.msc`)
2. Find "postgresql-x64-{version}"
3. Check the binary path - the data directory is usually in the same location

**Method 3: Using Command Line**
```bash
psql -U postgres
```

Then run:
```sql
SHOW data_directory;
```

### Inside the Data Directory

Your database `uon_marketplace` will be stored as a subdirectory:

```
{data_directory}/
└── base/
    └── {database_oid}/
        ├── pg_class    # Table definitions
        ├── pg_attribute # Column definitions
        ├── {table_files} # Actual data files
        └── ...
```

**Note:** The database folder uses an OID (Object Identifier) number, not the database name directly.

### To Find Your Database OID:

```sql
SELECT oid, datname 
FROM pg_database 
WHERE datname = 'uon_marketplace';
```

### Database Files Structure

PostgreSQL stores your tables as files within the database directory:
- Each table has its own data files
- Files are organized by relation OID
- Indexes are stored separately
- WAL (Write-Ahead Log) files for transactions

### What's NOT in Your Project Folder

❌ The actual database data files are **NOT** in:
- `backend/database/` folder
- Your project directory
- Git repository

✅ What **IS** in your project folder:
- `database/schema.sql` - SQL schema definition
- `database/seed.sql` - Sample data SQL
- `database/init.js` - Initialization script
- `database/test-database.js` - Test script
- `models/` - Application models (not database files)

### How to Access Your Database

#### **Option 1: Using psql (Command Line)**
```bash
psql -U postgres -d uon_marketplace
```

#### **Option 2: Using pgAdmin (GUI)**
1. Open pgAdmin
2. Connect to PostgreSQL server
3. Expand "Databases"
4. Find "uon_marketplace"

#### **Option 3: Using Application**
Your Node.js application connects via connection string:
```
postgresql://postgres:password@localhost:5432/uon_marketplace
```

### Backup Location

When you create a backup, you can save it anywhere:

```bash
# Backup to project folder
pg_dump -U postgres -d uon_marketplace > backend/database/backup.sql

# Or backup to any location
pg_dump -U postgres -d uon_marketplace > C:/backups/uon_marketplace.sql
```

### Important Notes

1. **Don't modify data files directly** - Always use SQL commands
2. **Database is server-managed** - PostgreSQL server manages all files
3. **Connection string** - Your app connects via network (localhost), not file access
4. **Data persists** - Database remains even if you delete project files

### Quick Check Commands

```bash
# List all databases
psql -U postgres -c "\l"

# Check if your database exists
psql -U postgres -c "SELECT datname FROM pg_database WHERE datname = 'uon_marketplace';"

# Get database size
psql -U postgres -d uon_marketplace -c "SELECT pg_size_pretty(pg_database_size('uon_marketplace'));"
```

### Summary

- **Database Name:** `uon_marketplace`
- **Location:** PostgreSQL data directory (managed by PostgreSQL server)
- **Access Method:** Through PostgreSQL server (not direct file access)
- **Project Files:** Only schema definitions and scripts, not actual data files

Your database is safely stored by PostgreSQL and will persist independently of your project files!
