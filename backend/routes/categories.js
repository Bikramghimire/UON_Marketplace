/**
 * Categories Routes
 * API endpoints for categories management
 */

import express from 'express';
import Category from '../models/Category.js';

const router = express.Router();

/**
 * GET /api/categories
 * Get all categories
 */
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
});

/**
 * GET /api/categories/:id
 * Get category by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category',
      error: error.message
    });
  }
});

/**
 * POST /api/categories
 * Create a new category
 */
router.post('/', async (req, res) => {
  try {
    const categoryData = {
      name: req.body.name,
      description: req.body.description,
      icon: req.body.icon
    };

    if (!categoryData.name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    const category = await Category.create(categoryData);
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating category',
      error: error.message
    });
  }
});

export default router;
