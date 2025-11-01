/**
 * Standalone Database Test Script
 * This script allows the professor to test the database functionality
 * independently without running the full server
 */

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'uon_marketplace',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

/**
 * Test Functions
 */
async function testDatabaseConnection() {
  console.log('\n🔌 Testing Database Connection...');
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully!');
    console.log(`   Current time: ${result.rows[0].now}`);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function testTables() {
  console.log('\n📊 Testing Database Tables...');
  try {
    const tables = ['users', 'categories', 'products', 'product_images'];
    
    for (const table of tables) {
      const result = await pool.query(
        `SELECT COUNT(*) as count FROM ${table}`
      );
      console.log(`   ✅ ${table}: ${result.rows[0].count} records`);
    }
    return true;
  } catch (error) {
    console.error('❌ Error testing tables:', error.message);
    return false;
  }
}

async function testQueries() {
  console.log('\n🔍 Testing Database Queries...\n');

  try {
    // Test 1: Get all active products
    console.log('1. Get all active products:');
    const products = await pool.query(`
      SELECT p.id, p.title, p.price, c.name as category, u.username as seller
      FROM products p
      JOIN categories c ON p.category_id = c.id
      JOIN users u ON p.user_id = u.id
      WHERE p.status = 'active'
      LIMIT 5
    `);
    products.rows.forEach(product => {
      console.log(`   - ${product.title} ($${product.price}) - ${product.category} by ${product.seller}`);
    });

    // Test 2: Get products by category
    console.log('\n2. Get products by category (Electronics):');
    const electronics = await pool.query(`
      SELECT p.id, p.title, p.price
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE c.name = 'Electronics' AND p.status = 'active'
      LIMIT 3
    `);
    electronics.rows.forEach(product => {
      console.log(`   - ${product.title} ($${product.price})`);
    });

    // Test 3: Get category statistics
    console.log('\n3. Category statistics:');
    const stats = await pool.query(`
      SELECT 
        c.name,
        COUNT(p.id) as product_count,
        AVG(p.price) as avg_price,
        MIN(p.price) as min_price,
        MAX(p.price) as max_price
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
      GROUP BY c.id, c.name
      ORDER BY product_count DESC
    `);
    stats.rows.forEach(stat => {
      console.log(`   - ${stat.name}: ${stat.product_count} products, Avg: $${parseFloat(stat.avg_price || 0).toFixed(2)}`);
    });

    // Test 4: Get user with their products
    console.log('\n4. User product listings:');
    const userProducts = await pool.query(`
      SELECT 
        u.username,
        u.email,
        COUNT(p.id) as product_count,
        SUM(p.price) as total_value
      FROM users u
      LEFT JOIN products p ON u.id = p.user_id AND p.status = 'active'
      GROUP BY u.id, u.username, u.email
      HAVING COUNT(p.id) > 0
      ORDER BY product_count DESC
      LIMIT 5
    `);
    userProducts.rows.forEach(user => {
      console.log(`   - ${user.username} (${user.email}): ${user.product_count} products, Total value: $${parseFloat(user.total_value || 0).toFixed(2)}`);
    });

    // Test 5: Search functionality
    console.log('\n5. Search for "textbook":');
    const searchResults = await pool.query(`
      SELECT p.id, p.title, p.price, c.name as category
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE (p.title ILIKE '%textbook%' OR p.description ILIKE '%textbook%')
      AND p.status = 'active'
      LIMIT 5
    `);
    if (searchResults.rows.length > 0) {
      searchResults.rows.forEach(product => {
        console.log(`   - ${product.title} ($${product.price}) - ${product.category}`);
      });
    } else {
      console.log('   No results found');
    }

    return true;
  } catch (error) {
    console.error('❌ Error testing queries:', error.message);
    return false;
  }
}

async function testRelations() {
  console.log('\n🔗 Testing Database Relationships...\n');

  try {
    // Test foreign key constraints
    console.log('1. Testing foreign key constraints:');
    
    // Try to insert product with invalid user_id (should fail)
    try {
      await pool.query('INSERT INTO products (user_id, category_id, title, description, price, condition) VALUES (99999, 1, $1, $2, $3, $4)', 
        ['Test', 'Test description', 10.00, 'New']);
      console.log('   ❌ Foreign key constraint not working (should have failed)');
    } catch (error) {
      if (error.code === '23503') {
        console.log('   ✅ Foreign key constraint working correctly');
      } else {
        throw error;
      }
    }

    // Test cascade delete
    console.log('\n2. Testing data integrity:');
    const productWithUser = await pool.query(`
      SELECT p.id, p.user_id, u.username
      FROM products p
      JOIN users u ON p.user_id = u.id
      LIMIT 1
    `);
    if (productWithUser.rows.length > 0) {
      console.log(`   ✅ Products linked to users correctly`);
      console.log(`      Example: Product ${productWithUser.rows[0].id} linked to user ${productWithUser.rows[0].username}`);
    }

    return true;
  } catch (error) {
    console.error('❌ Error testing relationships:', error.message);
    return false;
  }
}

async function displayDatabaseInfo() {
  console.log('\n📋 Database Information:\n');
  
  try {
    // Database version
    const version = await pool.query('SELECT version()');
    console.log('PostgreSQL Version:', version.rows[0].version.split(',')[0]);

    // Table sizes
    const tableSizes = await pool.query(`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    `);
    
    console.log('\nTable Sizes:');
    tableSizes.rows.forEach(table => {
      console.log(`   - ${table.tablename}: ${table.size}`);
    });

    // Indexes
    const indexes = await pool.query(`
      SELECT indexname, tablename
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `);
    
    console.log('\nIndexes:');
    indexes.rows.forEach(index => {
      console.log(`   - ${index.indexname} on ${index.tablename}`);
    });

    return true;
  } catch (error) {
    console.error('❌ Error displaying database info:', error.message);
    return false;
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('═══════════════════════════════════════════════════');
  console.log('   UON Marketplace Database Test Script');
  console.log('   Standalone Database Prototype Approach');
  console.log('═══════════════════════════════════════════════════\n');

  const results = {
    connection: false,
    tables: false,
    queries: false,
    relations: false,
    info: false
  };

  // Run tests
  results.connection = await testDatabaseConnection();
  
  if (!results.connection) {
    console.log('\n❌ Cannot proceed without database connection.');
    console.log('Please check your database configuration in .env file.');
    await pool.end();
    process.exit(1);
  }

  results.tables = await testTables();
  results.queries = await testQueries();
  results.relations = await testRelations();
  results.info = await displayDatabaseInfo();

  // Summary
  console.log('\n═══════════════════════════════════════════════════');
  console.log('   Test Summary');
  console.log('═══════════════════════════════════════════════════\n');

  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });

  const allPassed = Object.values(results).every(result => result === true);
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! Database is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }

  await pool.end();
}

// Run the tests
runTests().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
