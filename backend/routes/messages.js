import express from 'express';
import { Op } from 'sequelize';
import { sequelize } from '../models/index.js';
import { Message, User, Product, StudentEssential } from '../models/index.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();


router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;

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
      
            if (message.recipientId === userId && !message.read) {
        conversation.unreadCount++;
      }

            if (new Date(message.createdAt) > new Date(conversation.lastMessage.createdAt)) {
        conversation.lastMessage = message;
      }
    });

        const conversations = Array.from(conversationsMap.values())
      .sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));

    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});


router.get('/conversation/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId } = req.query;
    const currentUserId = req.user.id;

        if (!userId || typeof userId !== 'string' || userId === '[object Object]') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

        if (productId && (typeof productId !== 'string' || productId === '[object Object]')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }

        const whereClause = {
      [Op.or]: [
        { senderId: currentUserId, recipientId: userId },
        { senderId: userId, recipientId: currentUserId }
      ]
    };

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
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});


router.post('/', protect, async (req, res) => {
  try {
    const { recipient, product, subject, content, meetingDate, meetingTime, meetingLocation } = req.body;
    const senderId = req.user.id;

        if (!recipient || !content) {
      return res.status(400).json({
        success: false,
        message: 'Recipient and message content are required'
      });
    }

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

        if (typeof recipientId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Recipient must be a valid UUID string'
      });
    }

        if (recipientId === senderId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a message to yourself'
      });
    }

        const recipientUser = await User.findByPk(recipientId);
    if (!recipientUser) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

        let productDoc = null;
    let messageSubject = subject;
    let productIdValue = null;
    
    if (product) {
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

            if (typeof extractedProductId !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Product must be a valid UUID string'
        });
      }

            productDoc = await Product.findByPk(extractedProductId);
      let isStudentEssential = false;
      
      if (!productDoc) {
                const studentEssential = await StudentEssential.findByPk(extractedProductId);
        if (studentEssential) {
          productDoc = studentEssential;
          isStudentEssential = true;
        } else {
          return res.status(404).json({
            success: false,
            message: 'Product not found'
          });
        }
      }
      
            if (!messageSubject) {
        messageSubject = `Inquiry about: ${productDoc.title}`;
      }
      productIdValue = extractedProductId;
    }

        const messageData = {
      senderId: senderId,
      recipientId: recipientId,
      productId: productIdValue,
      subject: messageSubject || 'New Message',
      content: content
    };

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

        const message = await Message.create(messageData);

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

        let productData = populatedMessage.product;
    if (!productData && productIdValue) {
      const studentEssential = await StudentEssential.findByPk(productIdValue, {
        attributes: ['id', 'title', 'images']
      });
      if (studentEssential) {
                productData = {
          id: studentEssential.id,
          title: studentEssential.title,
          price: null,           images: studentEssential.images || []
        };
      }
    }

        const msg = populatedMessage.toJSON();
    const transformedMessage = {
      ...msg,
      _id: msg.id,
      sender: msg.sender,
      recipient: msg.recipient,
      product: productData || msg.product,
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
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});


router.put('/:id/read', protect, async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

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
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});


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
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

export default router;
