import express from 'express';
import { Op } from 'sequelize';
import { Product, Category, User } from '../models/index.js';
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

    // Build where clause
    const where = { status };

    // Category filter
    let categoryId = null;
    if (category && category !== 'All') {
      const categoryDoc = await Category.findOne({ where: { name: category } });
      if (categoryDoc) {
        categoryId = categoryDoc.id;
        where.categoryId = categoryId;
      } else {
        return res.json({
          success: true,
          data: []
        });
      }
    }

    // Price filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = Number(minPrice);
      if (maxPrice) where.price[Op.lte] = Number(maxPrice);
    }

    // Search filter
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Build order
    let order = [];
    switch (sortBy) {
      case 'price-low':
        order = [['price', 'ASC']];
        break;
      case 'price-high':
        order = [['price', 'DESC']];
        break;
      case 'newest':
      default:
        order = [['createdAt', 'DESC']];
        break;
    }

    // Execute query
    const products = await Product.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'location']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      order
    });

    // Transform products to match frontend format
    const transformedProducts = products.map(product => {
      const images = product.images || [];
      return {
        id: product.id,
        title: product.title,
        price: parseFloat(product.price),
        category: product.category?.name || 'Uncategorized',
        description: product.description,
        image: images.find(img => img.isPrimary)?.url || images[0]?.url || '📦',
        seller: product.user?.username || 'Unknown',
        location: product.location || product.user?.location || 'N/A',
        datePosted: product.createdAt,
        condition: product.condition,
        status: product.status,
        views: product.views
      };
    });

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
    const products = await Product.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'location']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Transform products to match frontend format
    const transformedProducts = products.map(product => {
      const images = product.images || [];
      return {
        id: product.id,
        title: product.title,
        price: parseFloat(product.price),
        category: product.category?.name || 'Uncategorized',
        description: product.description,
        image: images.find(img => img.isPrimary)?.url || images[0]?.url || '📦',
        seller: product.user?.username || 'Unknown',
        location: product.location || product.user?.location || 'N/A',
        datePosted: product.createdAt,
        condition: product.condition,
        status: product.status,
        views: product.views,
        images: product.images,
        user: product.user
      };
    });

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
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'location']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ]
    });

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
    const images = product.images || [];
    const transformedProduct = {
      id: product.id,
      title: product.title,
      price: parseFloat(product.price),
      category: product.category?.name || 'Uncategorized',
      description: product.description,
      image: images.find(img => img.isPrimary)?.url || images[0]?.url || '📦',
      seller: product.user?.username || 'Unknown',
      location: product.location || product.user?.location || 'N/A',
      datePosted: product.createdAt,
      condition: product.condition,
      status: product.status,
      views: product.views,
      images: product.images,
      user: product.user // Include full user object for messaging
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
    const categoryDoc = await Category.findOne({ where: { name: category } });
    
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

    // If no images provided, use default emoji
    if (processedImages.length === 0) {
      processedImages = [{
        url: '📦',
        isPrimary: true
      }];
    }

    // Create product
    const product = await Product.create({
      title,
      description,
      price: Number(price),
      categoryId: categoryDoc.id,
      condition: condition || 'Good',
      location,
      userId: req.user.id,
      images: processedImages
    });

    const populatedProduct = await Product.findByPk(product.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'location']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ]
    });

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

    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user owns the product
    if (product.userId !== req.user.id) {
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

    const populatedProduct = await Product.findByPk(product.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'location']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ]
    });

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
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user owns the product
    if (product.userId !== req.user.id) {
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

    await product.destroy();

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
