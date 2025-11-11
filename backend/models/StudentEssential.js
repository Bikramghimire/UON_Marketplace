import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const StudentEssential = sequelize.define('StudentEssential', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'user_id'
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id'
    },
    field: 'category_id'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      len: [1, 200]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  condition: {
    type: DataTypes.ENUM('New', 'Like New', 'Excellent', 'Good', 'Fair'),
    defaultValue: 'Good',
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'claimed', 'inactive'),
    defaultValue: 'active',
    allowNull: false
  },
  images: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  }
}, {
  tableName: 'student_essentials',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['status', 'created_at']
    },
    {
      fields: ['category_id', 'status']
    },
    {
      fields: ['user_id']
    }
  ]
});

StudentEssential.associate = (models) => {
  StudentEssential.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
  StudentEssential.belongsTo(models.Category, {
    foreignKey: 'categoryId',
    as: 'category'
  });
  StudentEssential.hasMany(models.Message, {
    foreignKey: 'productId',
    as: 'messages'
  });
};

export default StudentEssential;

