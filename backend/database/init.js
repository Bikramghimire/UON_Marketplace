/**
 * Database Initialization Script
 * Standalone Database Prototype Approach
 * This script creates the database schema and seeds it with test data
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: 'postgres', // Connect to default postgres database first
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

const dbName = process.env.DB_NAME || 'uon_marketplace';

/**
 * Create database if it doesn't exist
 */
async function createDatabase() {
  try {
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
  }
}

/**
 * Read and execute SQL file
 */
async function executeSQLFile(filePath) {
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    // Connect to the actual database
    const dbPool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: dbName,
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 5432,
    });

    // Split SQL file by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim().length > 0) {
        await dbPool.query(statement);
      }
    }

    await dbPool.end();
    console.log(`✅ Executed: ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`❌ Error executing ${filePath}:`, error.message);
    throw error;
  }
}

/**
 * Main initialization function
 */
async function initializeDatabase() {
  console.log('🚀 Starting database initialization...\n');

  try {
    // Step 1: Create database
    await createDatabase();

    // Step 2: Execute schema
    console.log('\n📋 Creating database schema...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    await executeSQLFile(schemaPath);

    // Step 3: Seed data
    console.log('\n🌱 Seeding database with test data...');
    const seedPath = path.join(__dirname, 'seed.sql');
    await executeSQLFile(seedPath);

    console.log('\n✅ Database initialization completed successfully!');
    console.log('\n📊 Database Statistics:');
    console.log(`   - Database: ${dbName}`);
    console.log(`   - Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   - Port: ${process.env.DB_PORT || 5432}`);

    // Display statistics
    const statsPool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: dbName,
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 5432,
    });

    const userCount = await statsPool.query('SELECT COUNT(*) FROM users');
    const productCount = await statsPool.query('SELECT COUNT(*) FROM products');
    const categoryCount = await statsPool.query('SELECT COUNT(*) FROM categories');

    console.log(`   - Users: ${userCount.rows[0].count}`);
    console.log(`   - Products: ${productCount.rows[0].count}`);
    console.log(`   - Categories: ${categoryCount.rows[0].count}`);

    await statsPool.end();

  } catch (error) {
    console.error('\n❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run initialization
initializeDatabase();
