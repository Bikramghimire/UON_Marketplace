import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  senderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'sender_id'
  },
  recipientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'recipient_id'
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'products',
      key: 'id'
    },
    field: 'product_id'
  },
  subject: {
    type: DataTypes.STRING(200),
    allowNull: true,
    trim: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  meetingDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'meeting_date'
  },
  meetingTime: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'meeting_time'
  },
  meetingLocationName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'meeting_location_name'
  },
  meetingLocationLat: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
    field: 'meeting_location_lat'
  },
  meetingLocationLng: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
    field: 'meeting_location_lng'
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'read_at'
  }
}, {
  tableName: 'messages',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['sender_id', 'recipient_id', 'created_at']
    },
    {
      fields: ['recipient_id', 'read', 'created_at']
    },
    {
      fields: ['product_id']
    }
  ]
});

// Define associations
Message.associate = (models) => {
  Message.belongsTo(models.User, {
    foreignKey: 'senderId',
    as: 'sender'
  });
  Message.belongsTo(models.User, {
    foreignKey: 'recipientId',
    as: 'recipient'
  });
  Message.belongsTo(models.Product, {
    foreignKey: 'productId',
    as: 'product'
  });
};

export default Message;
