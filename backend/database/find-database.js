/**
 * Find Database Location Script
 * This script helps you find where PostgreSQL stores your database
 */

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: 'postgres', // Connect to default database first
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

const dbName = process.env.DB_NAME || 'uon_marketplace';

async function findDatabaseLocation() {
  console.log('═══════════════════════════════════════════════════');
  console.log('   Finding PostgreSQL Database Location');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    // Get PostgreSQL data directory
    const dataDirResult = await pool.query('SHOW data_directory');
    console.log('📍 PostgreSQL Data Directory:');
    console.log(`   ${dataDirResult.rows[0].data_directory}\n`);

    // Get config file location
    const configFileResult = await pool.query('SHOW config_file');
    console.log('⚙️  PostgreSQL Config File:');
    console.log(`   ${configFileResult.rows[0].config_file}\n`);

    // Check if database exists
    const dbCheck = await pool.query(
      `SELECT oid, datname, pg_size_pretty(pg_database_size(datname)) as size
       FROM pg_database 
       WHERE datname = $1`,
      [dbName]
    );

    if (dbCheck.rows.length > 0) {
      const dbInfo = dbCheck.rows[0];
      console.log(`✅ Database Found: ${dbName}`);
      console.log(`   OID: ${dbInfo.oid}`);
      console.log(`   Size: ${dbInfo.size}\n`);

      // Get database location within data directory
      console.log('📂 Database Files Location:');
      console.log(`   ${dataDirResult.rows[0].data_directory}/base/${dbInfo.oid}/\n`);

      // Get table information
      const dbPool = new Pool({
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: dbName,
        password: process.env.DB_PASSWORD || 'password',
        port: process.env.DB_PORT || 5432,
      });

      const tables = await dbPool.query(`
        SELECT 
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
      `);

      if (tables.rows.length > 0) {
        console.log('📊 Tables in Database:');
        tables.rows.forEach(table => {
          console.log(`   - ${table.tablename} (${table.size})`);
        });
      }

      await dbPool.end();
    } else {
      console.log(`❌ Database "${dbName}" not found.`);
      console.log('   Run: npm run db:init\n');
    }

    // Get PostgreSQL version
    const versionResult = await pool.query('SELECT version()');
    console.log('\n📌 PostgreSQL Version:');
    console.log(`   ${versionResult.rows[0].version.split(',')[0]}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure PostgreSQL server is running!');
    }
  } finally {
    await pool.end();
  }
}

findDatabaseLocation();
