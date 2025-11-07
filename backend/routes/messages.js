import express from 'express';
import { Op } from 'sequelize';
import { sequelize } from '../models/index.js';
import { Message, User, Product } from '../models/index.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/messages
 * @desc    Get all conversations for current user
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all messages where user is sender or recipient
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId },
          { recipientId: userId }
        ]
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'email', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'recipient',
          attributes: ['id', 'username', 'email', 'firstName', 'lastName']
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'title', 'price', 'images'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Group by conversation partner
    const conversationsMap = new Map();

    messages.forEach(message => {
      const otherUserId = message.senderId === userId 
        ? message.recipientId 
        : message.senderId;
      
      if (!conversationsMap.has(otherUserId)) {
        const otherUser = message.senderId === userId 
          ? message.recipient 
          : message.sender;
        
        conversationsMap.set(otherUserId, {
          _id: otherUserId,
          otherUser: otherUser,
          lastMessage: message,
          unreadCount: 0,
          totalMessages: 0
        });
      }

      const conversation = conversationsMap.get(otherUserId);
      conversation.totalMessages++;
      
      // Count unread messages
      if (message.recipientId === userId && !message.read) {
        conversation.unreadCount++;
      }

      // Update last message if this one is more recent
      if (new Date(message.createdAt) > new Date(conversation.lastMessage.createdAt)) {
        conversation.lastMessage = message;
      }
    });

    // Convert to array and sort by last message date
    const conversations = Array.from(conversationsMap.values())
      .sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));

    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

/**
 * @route   GET /api/messages/conversation/:userId
 * @desc    Get conversation with a specific user
 * @access  Private
 */
router.get('/conversation/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId } = req.query;
    const currentUserId = req.user.id;

    // Validate userId is a valid UUID string
    if (!userId || typeof userId !== 'string' || userId === '[object Object]') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Validate productId if provided
    if (productId && (typeof productId !== 'string' || productId === '[object Object]')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }

    // Build query
    const whereClause = {
      [Op.or]: [
        { senderId: currentUserId, recipientId: userId },
        { senderId: userId, recipientId: currentUserId }
      ]
    };

    // Filter by product if provided
    if (productId) {
      whereClause.productId = productId;
    }

    const messages = await Message.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'email', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'recipient',
          attributes: ['id', 'username', 'email', 'firstName', 'lastName']
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'title', 'price', 'images'],
          required: false
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    // Mark messages as read
    await Message.update(
      {
        read: true,
        readAt: new Date()
      },
      {
        where: {
          recipientId: currentUserId,
          senderId: userId,
          read: false
        }
      }
    );

    // Transform messages to match frontend expectations
    const transformedMessages = messages.map(message => {
      const msg = message.toJSON();
      return {
        ...msg,
        _id: msg.id,
        meetingLocation: msg.meetingLocationName ? {
          name: msg.meetingLocationName,
          coordinates: msg.meetingLocationLat && msg.meetingLocationLng ? {
            lat: parseFloat(msg.meetingLocationLat),
            lng: parseFloat(msg.meetingLocationLng)
          } : null
        } : null
      };
    });

    res.json({
      success: true,
      data: transformedMessages
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

/**
 * @route   POST /api/messages
 * @desc    Send a message
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
  try {
    const { recipient, product, subject, content, meetingDate, meetingTime, meetingLocation } = req.body;
    const senderId = req.user.id;

    // Validation
    if (!recipient || !content) {
      return res.status(400).json({
        success: false,
        message: 'Recipient and message content are required'
      });
    }

    // Extract recipient ID if it's an object
    let recipientId = recipient;
    if (typeof recipient === 'object' && recipient !== null) {
      recipientId = recipient.id || recipient._id || null;
      if (!recipientId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid recipient format. Expected UUID string.'
        });
      }
    }

    // Ensure recipient is a string
    if (typeof recipientId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Recipient must be a valid UUID string'
      });
    }

    // Prevent sending message to yourself
    if (recipientId === senderId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a message to yourself'
      });
    }

    // Verify recipient exists
    const recipientUser = await User.findByPk(recipientId);
    if (!recipientUser) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    // Verify product exists and get it for subject if not provided
    let productDoc = null;
    let messageSubject = subject;
    let productIdValue = null;
    
    if (product) {
      // Extract product ID if it's an object
      let extractedProductId = product;
      if (typeof product === 'object' && product !== null) {
        extractedProductId = product.id || product._id || null;
        if (!extractedProductId) {
          return res.status(400).json({
            success: false,
            message: 'Invalid product format. Expected UUID string.'
          });
        }
      }

      // Ensure product is a string
      if (typeof extractedProductId !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Product must be a valid UUID string'
        });
      }

      productDoc = await Product.findByPk(extractedProductId);
      if (!productDoc) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      // Auto-generate subject if not provided and product exists
      if (!messageSubject) {
        messageSubject = `Inquiry about: ${productDoc.title}`;
      }
      productIdValue = extractedProductId;
    }

    // Prepare message data
    const messageData = {
      senderId: senderId,
      recipientId: recipientId,
      productId: productIdValue,
      subject: messageSubject || 'New Message',
      content: content
    };

    // Add meeting details if provided
    if (meetingDate && meetingLocation) {
      messageData.meetingDate = new Date(meetingDate);
      if (meetingTime) {
        messageData.meetingTime = meetingTime;
      }
      if (meetingLocation) {
        messageData.meetingLocationName = meetingLocation.name || 'Selected Location';
        if (meetingLocation.coordinates) {
          messageData.meetingLocationLat = meetingLocation.coordinates.lat;
          messageData.meetingLocationLng = meetingLocation.coordinates.lng;
        }
      }
    }

    // Create message
    const message = await Message.create(messageData);

    // Populate with associations
    const populatedMessage = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'email', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'recipient',
          attributes: ['id', 'username', 'email', 'firstName', 'lastName']
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'title', 'price', 'images'],
          required: false
        }
      ]
    });

    // Transform to match frontend expectations
    const msg = populatedMessage.toJSON();
    const transformedMessage = {
      ...msg,
      _id: msg.id,
      sender: msg.sender,
      recipient: msg.recipient,
      product: msg.product,
      meetingLocation: msg.meetingLocationName ? {
        name: msg.meetingLocationName,
        coordinates: msg.meetingLocationLat && msg.meetingLocationLng ? {
          lat: parseFloat(msg.meetingLocationLat),
          lng: parseFloat(msg.meetingLocationLng)
        } : null
      } : null
    };

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: transformedMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

/**
 * @route   PUT /api/messages/:id/read
 * @desc    Mark message as read
 * @access  Private
 */
router.put('/:id/read', protect, async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the recipient
    if (message.recipientId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mark this message as read'
      });
    }

    message.read = true;
    message.readAt = new Date();
    await message.save();

    res.json({
      success: true,
      message: 'Message marked as read',
      data: message
    });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

/**
 * @route   GET /api/messages/unread-count
 * @desc    Get unread message count
 * @access  Private
 */
router.get('/unread-count', protect, async (req, res) => {
  try {
    const count = await Message.count({
      where: {
        recipientId: req.user.id,
        read: false
      }
    });

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

export default router;
