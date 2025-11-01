/**
 * Products Routes
 * API endpoints for products management
 */

import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

/**
 * GET /api/products
 * Get all products with optional filters
 */
router.get('/', async (req, res) => {
  try {
    const filters = {
      category_id: req.query.category_id,
      status: req.query.status || 'active',
      search: req.query.search,
      min_price: req.query.min_price,
      max_price: req.query.max_price,
      sortBy: req.query.sortBy || 'newest',
      limit: req.query.limit ? parseInt(req.query.limit) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset) : undefined,
    };

    const products = await Product.findAll(filters);
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

/**
 * GET /api/products/:id
 * Get product by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment views
    await Product.incrementViews(req.params.id);

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
});

/**
 * POST /api/products
 * Create a new product
 */
router.post('/', async (req, res) => {
  try {
    const productData = {
      user_id: req.body.user_id,
      category_id: req.body.category_id,
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      condition: req.body.condition,
      location: req.body.location,
      status: req.body.status || 'active'
    };

    // Validate required fields
    if (!productData.user_id || !productData.category_id || !productData.title || !productData.price) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: user_id, category_id, title, price'
      });
    }

    const product = await Product.create(productData);
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
});

/**
 * PUT /api/products/:id
 * Update a product
 */
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.update(req.params.id, req.body);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
});

/**
 * DELETE /api/products/:id
 * Delete a product (soft delete)
 */
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.delete(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
      data: product
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
});

export default router;
