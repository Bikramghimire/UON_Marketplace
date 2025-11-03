import express from 'express';
import Product from '../models/Product.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/products
 * @desc    Get all products with optional filters
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      sortBy,
      status = 'active'
    } = req.query;

    // Build query
    let query = { status };

    // Category filter
    if (category && category !== 'All') {
      // Find category by name
      const Category = (await import('../models/Category.js')).default;
      const categoryDoc = await Category.findOne({ name: category });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      } else {
        return res.json({
          success: true,
          data: []
        });
      }
    }

    // Price filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Build sort
    let sort = {};
    switch (sortBy) {
      case 'price-low':
        sort.price = 1;
        break;
      case 'price-high':
        sort.price = -1;
        break;
      case 'newest':
      default:
        sort.createdAt = -1;
        break;
    }

    // Execute query
    let productsQuery = Product.find(query)
      .populate('user', 'username email firstName lastName location')
      .populate('category', 'name icon')
      .sort(sort);

    // If search without text index, use regex
    if (search && !query.$text) {
      productsQuery = Product.find({
        ...query,
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      })
        .populate('user', 'username email firstName lastName location')
        .populate('category', 'name icon')
        .sort(sort);
    }

    const products = await productsQuery;

    // Transform products to match frontend format
    const transformedProducts = products.map(product => ({
      id: product._id,
      title: product.title,
      price: product.price,
      category: product.category?.name || 'Uncategorized',
      description: product.description,
      image: product.images?.find(img => img.isPrimary)?.url || product.images?.[0]?.url || '📦',
      seller: product.user?.username || 'Unknown',
      location: product.location || product.user?.location || 'N/A',
      datePosted: product.createdAt,
      condition: product.condition,
      status: product.status,
      views: product.views
    }));

    res.json({
      success: true,
      data: transformedProducts
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

/**
 * @route   GET /api/products/my
 * @desc    Get current user's products
 * @access  Private
 */
router.get('/my', protect, async (req, res) => {
  try {
    const products = await Product.find({ user: req.user._id })
      .populate('user', 'username email firstName lastName location')
      .populate('category', 'name icon')
      .sort({ createdAt: -1 });

    // Transform products to match frontend format
    const transformedProducts = products.map(product => ({
      id: product._id,
      title: product.title,
      price: product.price,
      category: product.category?.name || 'Uncategorized',
      description: product.description,
      image: product.images?.find(img => img.isPrimary)?.url || product.images?.[0]?.url || '📦',
      seller: product.user?.username || 'Unknown',
      location: product.location || product.user?.location || 'N/A',
      datePosted: product.createdAt,
      condition: product.condition,
      status: product.status,
      views: product.views,
      images: product.images,
      user: product.user
    }));

    res.json({
      success: true,
      data: transformedProducts
    });
  } catch (error) {
    console.error('Get user products error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

/**
 * @route   GET /api/products/:id
 * @desc    Get product by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('user', 'username email firstName lastName location')
      .populate('category', 'name icon');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment views
    product.views += 1;
    await product.save();

    // Transform product
    const transformedProduct = {
      id: product._id,
      title: product.title,
      price: product.price,
      category: product.category?.name || 'Uncategorized',
      description: product.description,
      image: product.images?.find(img => img.isPrimary)?.url || product.images?.[0]?.url || '📦',
      seller: product.user?.username || 'Unknown',
      location: product.location || product.user?.location || 'N/A',
      datePosted: product.createdAt,
      condition: product.condition,
      status: product.status,
      views: product.views,
      images: product.images
    };

    res.json({
      success: true,
      data: transformedProduct
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
      condition,
      location,
      images
    } = req.body;

    // Validation
    if (!title || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, price, and category'
      });
    }

    // Find category
    const Category = (await import('../models/Category.js')).default;
    const categoryDoc = await Category.findOne({ name: category });
    
    if (!categoryDoc) {
      return res.status(400).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Process images
    let processedImages = [];
    if (images && Array.isArray(images)) {
      processedImages = images.map((img, index) => ({
        url: typeof img === 'string' ? img : img.url || '',
        isPrimary: index === 0 || img.isPrimary || false
      })).filter(img => img.url); // Remove empty images
    }

    // If no images provided, use default emoji based on category
    if (processedImages.length === 0) {
      processedImages = [{
        url: categoryDoc.icon || '📦',
        isPrimary: true
      }];
    }

    // Create product
    const product = await Product.create({
      title,
      description,
      price: Number(price),
      category: categoryDoc._id,
      condition: condition || 'Good',
      location,
      user: req.user._id,
      images: processedImages
    });

    const populatedProduct = await Product.findById(product._id)
      .populate('user', 'username email firstName lastName location')
      .populate('category', 'name icon');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: populatedProduct
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

/**
 * @route   PUT /api/products/:id/status
 * @desc    Update product status (mark as sold/inactive)
 * @access  Private (product owner only)
 */
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['active', 'sold', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be active, sold, or inactive'
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user owns the product
    if (product.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    // Prevent users from reactivating products that were deactivated by admin
    if (product.status === 'inactive' && status === 'active') {
      return res.status(403).json({
        success: false,
        message: 'You cannot reactivate a product that was deactivated by admin'
      });
    }

    // Prevent users from marking products as inactive (only admin can do that)
    if (status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can mark products as inactive'
      });
    }

    product.status = status;
    await product.save();

    const populatedProduct = await Product.findById(product._id)
      .populate('user', 'username email firstName lastName location')
      .populate('category', 'name icon');

    res.json({
      success: true,
      message: 'Product status updated successfully',
      data: populatedProduct
    });
  } catch (error) {
    console.error('Update product status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product
 * @access  Private (product owner only)
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user owns the product
    if (product.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    // Prevent users from deleting products that were deactivated by admin
    if (product.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'You cannot delete a product that was deactivated by admin'
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

export default router;

