/**
 * Test Routes
 * API endpoints specifically for database testing
 * These endpoints help professors test the database functionality
 */

import express from 'express';
import pool from '../config/database.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

const router = express.Router();

/**
 * GET /api/test
 * Test database connection
 */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time, version() as version');
    res.json({
      success: true,
      message: 'Database connection successful',
      data: {
        current_time: result.rows[0].current_time,
        version: result.rows[0].version.split(',')[0]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

/**
 * GET /api/test/tables
 * Get table statistics
 */
router.get('/tables', async (req, res) => {
  try {
    const tables = ['users', 'categories', 'products', 'product_images'];
    const stats = {};

    for (const table of tables) {
      const result = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
      stats[table] = parseInt(result.rows[0].count);
    }

    res.json({
      success: true,
      message: 'Table statistics',
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching table statistics',
      error: error.message
    });
  }
});

/**
 * GET /api/test/schema
 * Get database schema information
 */
router.get('/schema', async (req, res) => {
  try {
    const tables = ['users', 'categories', 'products', 'product_images'];
    const schema = {};

    for (const table of tables) {
      const result = await pool.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [table]);
      schema[table] = result.rows;
    }

    res.json({
      success: true,
      message: 'Database schema',
      data: schema
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching schema',
      error: error.message
    });
  }
});

/**
 * GET /api/test/products-summary
 * Get products summary statistics
 */
router.get('/products-summary', async (req, res) => {
  try {
    const summary = await pool.query(`
      SELECT 
        COUNT(*) as total_products,
        COUNT(*) FILTER (WHERE status = 'active') as active_products,
        COUNT(*) FILTER (WHERE status = 'sold') as sold_products,
        AVG(price) as avg_price,
        MIN(price) as min_price,
        MAX(price) as max_price,
        SUM(views) as total_views
      FROM products
    `);

    const categoryStats = await pool.query(`
      SELECT 
        c.name as category,
        COUNT(p.id) as product_count,
        AVG(p.price) as avg_price
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
      GROUP BY c.id, c.name
      ORDER BY product_count DESC
    `);

    res.json({
      success: true,
      message: 'Products summary statistics',
      data: {
        summary: summary.rows[0],
        by_category: categoryStats.rows
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products summary',
      error: error.message
    });
  }
});

/**
 * GET /api/test/relationships
 * Test database relationships
 */
router.get('/relationships', async (req, res) => {
  try {
    // Test user-product relationship
    const userProducts = await pool.query(`
      SELECT 
        u.username,
        COUNT(p.id) as product_count
      FROM users u
      LEFT JOIN products p ON u.id = p.user_id AND p.status = 'active'
      GROUP BY u.id, u.username
      HAVING COUNT(p.id) > 0
      ORDER BY product_count DESC
      LIMIT 5
    `);

    // Test category-product relationship
    const categoryProducts = await pool.query(`
      SELECT 
        c.name as category,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
      GROUP BY c.id, c.name
      ORDER BY product_count DESC
    `);

    res.json({
      success: true,
      message: 'Database relationships test',
      data: {
        user_product_relationships: userProducts.rows,
        category_product_relationships: categoryProducts.rows
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error testing relationships',
      error: error.message
    });
  }
});

/**
 * GET /api/test/sample-queries
 * Run sample queries to demonstrate database functionality
 */
router.get('/sample-queries', async (req, res) => {
  try {
    const results = {};

    // Query 1: Get active products
    results.active_products = await Product.findAll({ status: 'active', limit: 5 });

    // Query 2: Search products
    results.search_results = await Product.findAll({ search: 'textbook', limit: 3 });

    // Query 3: Products by category
    const electronicsCategory = await Category.findByName('Electronics');
    if (electronicsCategory) {
      results.electronics_products = await Product.findAll({ 
        category_id: electronicsCategory.id, 
        limit: 3 
      });
    }

    // Query 4: Price range
    results.price_range = await Product.findAll({ 
      min_price: 0, 
      max_price: 100, 
      limit: 5 
    });

    res.json({
      success: true,
      message: 'Sample queries executed successfully',
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error executing sample queries',
      error: error.message
    });
  }
});

export default router;
