/**
 * Complete Database Setup Script
 * This script creates database, schema, and seeds data with proper password hashing
 * Perfect for local testing setup
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection configuration
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: 'postgres', // Connect to default postgres database first
  password: process.env.DB_PASSWORD || 'password',
  port: parseInt(process.env.DB_PORT || '5432'),
};

const dbName = process.env.DB_NAME || 'uon_marketplace';
const testPassword = 'password123'; // Default password for all test users

/**
 * Create database if it doesn't exist
 */
async function createDatabase() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log('📦 Checking database...');
    
    // Check if database exists
    const dbCheck = await pool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (dbCheck.rows.length === 0) {
      console.log(`📦 Creating database: ${dbName}...`);
      await pool.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database ${dbName} created successfully!`);
    } else {
      console.log(`✅ Database ${dbName} already exists.`);
    }
  } catch (error) {
    console.error('❌ Error creating database:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

/**
 * Execute SQL file with better error handling
 */
async function executeSQLFile(filePath, databaseName = dbName) {
  const dbPool = new Pool({
    ...dbConfig,
    database: databaseName,
  });

  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Remove comments and split by semicolons
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => {
        const trimmed = stmt.trim();
        return trimmed.length > 0 && 
               !trimmed.startsWith('--') && 
               !trimmed.startsWith('/*');
      });

    for (const statement of statements) {
      if (statement.trim().length > 0) {
        try {
          await dbPool.query(statement);
        } catch (error) {
          // Skip errors for DROP TABLE IF EXISTS
          if (!error.message.includes('does not exist')) {
            console.error(`   ⚠️  Warning: ${error.message}`);
          }
        }
      }
    }

    console.log(`✅ Executed: ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`❌ Error executing ${filePath}:`, error.message);
    throw error;
  } finally {
    await dbPool.end();
  }
}

/**
 * Seed users with properly hashed passwords
 */
async function seedUsersWithHashedPasswords() {
  const dbPool = new Pool({
    ...dbConfig,
    database: dbName,
  });

  try {
    console.log('🔐 Hashing passwords and creating users...');
    
    // Hash password once
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    
    const users = [
      ['johndoe', 'john.doe@uon.edu', 'John', 'Doe', '555-0101', 'Campus Dorm', 'user'],
      ['sarahm', 'sarah.miller@uon.edu', 'Sarah', 'Miller', '555-0102', 'Off-Campus', 'user'],
      ['miket', 'mike.taylor@uon.edu', 'Mike', 'Taylor', '555-0103', 'Student Union', 'user'],
      ['emilyr', 'emily.rodriguez@uon.edu', 'Emily', 'Rodriguez', '555-0104', 'Campus Dorm', 'user'],
      ['davidl', 'david.lee@uon.edu', 'David', 'Lee', '555-0105', 'Off-Campus', 'user'],
      ['lisak', 'lisa.kim@uon.edu', 'Lisa', 'Kim', '555-0106', 'Library', 'user'],
      ['tomw', 'tom.wilson@uon.edu', 'Tom', 'Wilson', '555-0107', 'Campus Dorm', 'user'],
      ['annab', 'anna.brown@uon.edu', 'Anna', 'Brown', '555-0108', 'Off-Campus', 'user'],
      ['chrisp', 'chris.park@uon.edu', 'Chris', 'Park', '555-0109', 'Student Union', 'user'],
      ['rachels', 'rachel.smith@uon.edu', 'Rachel', 'Smith', '555-0110', 'Library', 'user'],
      ['kevinh', 'kevin.harris@uon.edu', 'Kevin', 'Harris', '555-0111', 'Campus Dorm', 'user'],
      ['jessican', 'jessica.nelson@uon.edu', 'Jessica', 'Nelson', '555-0112', 'Off-Campus', 'user'],
      ['admin', 'admin@uon.edu', 'Admin', 'User', '555-0001', 'Admin Office', 'admin'],
    ];

    for (const [username, email, firstName, lastName, phone, location, role] of users) {
      await dbPool.query(
        `INSERT INTO users (username, email, password, first_name, last_name, phone, location, role)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (username) DO NOTHING`,
        [username, email, hashedPassword, firstName, lastName, phone, location, role]
      );
    }

    console.log(`✅ Created ${users.length} users with password: "${testPassword}"`);
  } catch (error) {
    console.error('❌ Error seeding users:', error.message);
    throw error;
  } finally {
    await dbPool.end();
  }
}

/**
 * Main setup function
 */
async function setupDatabase() {
  console.log('═══════════════════════════════════════════════════');
  console.log('   UON Marketplace Database Setup');
  console.log('   Local PostgreSQL Server Setup');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    // Step 1: Create database
    await createDatabase();

    // Step 2: Execute schema
    console.log('\n📋 Creating database schema...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    await executeSQLFile(schemaPath);

    // Step 3: Seed categories
    console.log('\n📂 Creating categories...');
    const categoriesSQL = `
      INSERT INTO categories (name, description, icon) VALUES
      ('Textbooks', 'Academic textbooks and course materials', '📚'),
      ('Electronics', 'Laptops, phones, calculators, and gadgets', '💻'),
      ('Clothing', 'Apparel, shoes, and fashion accessories', '👕'),
      ('Furniture', 'Desks, chairs, and dorm essentials', '🏠'),
      ('Sports', 'Sports equipment and athletic gear', '⚽'),
      ('Services', 'Tutoring, services, and other offerings', '🛠️')
      ON CONFLICT (name) DO NOTHING;
    `;
    
    const categoryPool = new Pool({ ...dbConfig, database: dbName });
    await categoryPool.query(categoriesSQL);
    await categoryPool.end();
    console.log('✅ Categories created');

    // Step 4: Seed users with hashed passwords
    await seedUsersWithHashedPasswords();

    // Step 5: Seed products
    console.log('\n🛍️  Creating products...');
    const seedPath = path.join(__dirname, 'seed.sql');
    // Read seed.sql but skip user inserts
    const seedSQL = fs.readFileSync(seedPath, 'utf8');
    const productsSQL = seedSQL.split('-- Insert Sample Products')[1];
    if (productsSQL) {
      const productPool = new Pool({ ...dbConfig, database: dbName });
      const productStatements = productsSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && stmt.includes('INSERT'));
      
      for (const statement of productStatements) {
        if (statement.trim().length > 0) {
          try {
            await productPool.query(statement);
          } catch (error) {
            // Continue if products already exist
            if (!error.message.includes('duplicate key')) {
              console.error(`   ⚠️  ${error.message}`);
            }
          }
        }
      }
      await productPool.end();
      console.log('✅ Products created');
    }

    // Step 6: Display statistics
    console.log('\n═══════════════════════════════════════════════════');
    console.log('   Setup Complete!');
    console.log('═══════════════════════════════════════════════════\n');

    const statsPool = new Pool({ ...dbConfig, database: dbName });

    const userCount = await statsPool.query('SELECT COUNT(*) as count FROM users');
    const productCount = await statsPool.query('SELECT COUNT(*) as count FROM products');
    const categoryCount = await statsPool.query('SELECT COUNT(*) as count FROM categories');

    console.log('📊 Database Statistics:');
    console.log(`   Database: ${dbName}`);
    console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`   Users: ${userCount.rows[0].count}`);
    console.log(`   Products: ${productCount.rows[0].count}`);
    console.log(`   Categories: ${categoryCount.rows[0].count}\n`);

    console.log('🔐 Test Credentials:');
    console.log('   Email: john.doe@uon.edu (or any user email)');
    console.log(`   Password: ${testPassword}\n`);

    console.log('✅ Database is ready for local testing!');
    console.log('🚀 You can now start your server: npm start\n');

    await statsPool.end();

  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Make sure PostgreSQL is running on your local machine!');
      console.error('   Check: PostgreSQL service is started');
      console.error(`   Connection: ${dbConfig.host}:${dbConfig.port}`);
    }
    process.exit(1);
  }
}

// Run setup
setupDatabase();
