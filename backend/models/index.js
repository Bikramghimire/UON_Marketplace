import sequelize from '../config/database.js';
import User from './User.js';
import Category from './Category.js';
import Product from './Product.js';
import Message from './Message.js';
import StudentEssential from './StudentEssential.js';

const models = {
  User,
  Category,
  Product,
  Message,
  StudentEssential
};

Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

export { sequelize };
export { User, Category, Product, Message, StudentEssential };
export default models;

