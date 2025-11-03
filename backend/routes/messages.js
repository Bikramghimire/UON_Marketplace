import express from 'express';
import mongoose from 'mongoose';
import Message from '../models/Message.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/messages
 * @desc    Get all conversations for current user
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    // Get all conversations where user is either sender or recipient
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { recipient: req.user._id }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', req.user._id] },
              '$recipient',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$recipient', req.user._id] },
                    { $eq: ['$read', false] }
                  ]
                },
                1,
                0
              ]
            }
          },
          totalMessages: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'otherUser'
        }
      },
      {
        $unwind: '$otherUser'
      },
      {
        $project: {
          'otherUser.password': 0
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

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

    // Build query
    const query = {
      $or: [
        { sender: req.user._id, recipient: userId },
        { sender: userId, recipient: req.user._id }
      ]
    };

    // Filter by product if provided
    if (productId) {
      query.product = productId;
    }

    const messages = await Message.find(query)
      .populate('sender', 'username email firstName lastName')
      .populate('recipient', 'username email firstName lastName')
      .populate('product', 'title price images')
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      {
        recipient: req.user._id,
        sender: userId,
        read: false
      },
      {
        read: true,
        readAt: new Date()
      }
    );

    res.json({
      success: true,
      data: messages
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

    // Validation
    if (!recipient || !content) {
      return res.status(400).json({
        success: false,
        message: 'Recipient and message content are required'
      });
    }

    // Prevent sending message to yourself
    if (recipient === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a message to yourself'
      });
    }

    // Verify recipient exists
    const User = (await import('../models/User.js')).default;
    const recipientUser = await User.findById(recipient);
    if (!recipientUser) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    // Verify product exists and get it for subject if not provided
    let productDoc = null;
    let messageSubject = subject;
    let productId = null;
    
    if (product) {
      // Ensure product is a valid ObjectId string, not an object
      let extractedProductId = product;
      if (typeof product === 'object' && product !== null) {
        extractedProductId = product._id || product.id || null;
      }
      
      if (!extractedProductId || !mongoose.Types.ObjectId.isValid(extractedProductId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID'
        });
      }

      productDoc = await Product.findById(extractedProductId);
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
      
      // Use the valid product ID
      productId = extractedProductId;
    }

    // Prepare message data
    const messageData = {
      sender: req.user._id,
      recipient,
      product: productId,
      subject: messageSubject || 'New Message',
      content
    };

    // Add meeting details if provided
    if (meetingDate && meetingLocation) {
      messageData.meetingDate = new Date(meetingDate);
      if (meetingTime) {
        messageData.meetingTime = meetingTime;
      }
      if (meetingLocation) {
        messageData.meetingLocation = {
          name: meetingLocation.name || 'Selected Location',
          coordinates: meetingLocation.coordinates || {}
        };
      }
    }

    // Create message
    const message = await Message.create(messageData);

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username email firstName lastName')
      .populate('recipient', 'username email firstName lastName')
      .populate('product', 'title price images');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: populatedMessage
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
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the recipient
    if (message.recipient.toString() !== req.user._id.toString()) {
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
    const count = await Message.countDocuments({
      recipient: req.user._id,
      read: false
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

