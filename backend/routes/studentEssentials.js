import express from 'express';
import { Op } from 'sequelize';
import { StudentEssential, Category, User } from '../models/index.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();


router.get('/', async (req, res) => {
  try {
    const {
      category,
      search,
      sortBy,
      status = 'active'
    } = req.query;

        const where = { status };

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

        if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

        let order = [];
    switch (sortBy) {
      case 'newest':
      default:
        order = [['createdAt', 'DESC']];
        break;
    }

        const essentials = await StudentEssential.findAll({
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

        const transformedEssentials = essentials.map(essential => {
      const images = essential.images || [];
      return {
        id: essential.id,
        title: essential.title,
        price: 0,         category: essential.category?.name || 'Uncategorized',
        description: essential.description,
        image: images.find(img => img.isPrimary)?.url || images[0]?.url || '',
        seller: essential.user?.username || 'Unknown',
        location: essential.location || essential.user?.location || 'N/A',
        datePosted: essential.createdAt,
        condition: essential.condition,
        status: essential.status,
        views: essential.views
      };
    });

    res.json({
      success: true,
      data: transformedEssentials
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});


router.get('/my', protect, async (req, res) => {
  try {
    const essentials = await StudentEssential.findAll({
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

        const transformedEssentials = essentials.map(essential => {
      const images = essential.images || [];
      return {
        id: essential.id,
        title: essential.title,
        price: 0,         category: essential.category?.name || 'Uncategorized',
        description: essential.description,
        image: images.find(img => img.isPrimary)?.url || images[0]?.url || '',
        seller: essential.user?.username || 'Unknown',
        location: essential.location || essential.user?.location || 'N/A',
        datePosted: essential.createdAt,
        condition: essential.condition,
        status: essential.status,
        views: essential.views,
        images: essential.images,
        user: essential.user
      };
    });

    res.json({
      success: true,
      data: transformedEssentials
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const essential = await StudentEssential.findByPk(req.params.id, {
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

    if (!essential) {
      return res.status(404).json({
        success: false,
        message: 'Student essential not found'
      });
    }

        essential.views += 1;
    await essential.save();

        const images = essential.images || [];
    const transformedEssential = {
      id: essential.id,
      title: essential.title,
      price: 0,       category: essential.category?.name || 'Uncategorized',
      description: essential.description,
      image: images.find(img => img.isPrimary)?.url || images[0]?.url || '',
      seller: essential.user?.username || 'Unknown',
      location: essential.location || essential.user?.location || 'N/A',
      datePosted: essential.createdAt,
      condition: essential.condition,
      status: essential.status,
      views: essential.views,
      images: essential.images,
      user: essential.user     };

    res.json({
      success: true,
      data: transformedEssential
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});


router.post('/', protect, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      condition,
      location,
      images
    } = req.body;

        if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, and category'
      });
    }

        const categoryDoc = await Category.findOne({ where: { name: category } });
    
    if (!categoryDoc) {
      return res.status(400).json({
        success: false,
        message: 'Category not found'
      });
    }

        let processedImages = [];
    if (images && Array.isArray(images)) {
      processedImages = images.map((img, index) => ({
        url: typeof img === 'string' ? img : img.url || '',
        isPrimary: index === 0 || img.isPrimary || false
      })).filter(img => img.url);     }

        if (processedImages.length === 0) {
      processedImages = [{
        url: '',
        isPrimary: true
      }];
    }

        const essential = await StudentEssential.create({
      title,
      description,
      categoryId: categoryDoc.id,
      condition: condition || 'Good',
      location,
      userId: req.user.id,
      images: processedImages
    });

    const populatedEssential = await StudentEssential.findByPk(essential.id, {
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
      message: 'Student essential created successfully',
      data: populatedEssential
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});


router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['active', 'claimed', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be active, claimed, or inactive'
      });
    }

    const essential = await StudentEssential.findByPk(req.params.id);

    if (!essential) {
      return res.status(404).json({
        success: false,
        message: 'Student essential not found'
      });
    }

        if (essential.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this student essential'
      });
    }

        if (essential.status === 'inactive' && status === 'active') {
      return res.status(403).json({
        success: false,
        message: 'You cannot reactivate a student essential that was deactivated by admin'
      });
    }

        if (status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can mark student essentials as inactive'
      });
    }

    essential.status = status;
    await essential.save();

    const populatedEssential = await StudentEssential.findByPk(essential.id, {
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
      message: 'Student essential status updated successfully',
      data: populatedEssential
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});


router.delete('/:id', protect, async (req, res) => {
  try {
    const essential = await StudentEssential.findByPk(req.params.id);

    if (!essential) {
      return res.status(404).json({
        success: false,
        message: 'Student essential not found'
      });
    }

        if (essential.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this student essential'
      });
    }

        if (essential.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'You cannot delete a student essential that was deactivated by admin'
      });
    }

    await essential.destroy();

    res.json({
      success: true,
      message: 'Student essential deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

export default router;

