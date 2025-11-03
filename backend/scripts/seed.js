import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { connectDB } from '../config/database.js';

dotenv.config();

/**
 * Seed database with initial data
 */
const seedDatabase = async () => {
  try {
    console.log('🚀 Starting database seeding...\n');

    // Connect to database
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('✅ Cleared existing data\n');

    // Create categories
    console.log('📦 Creating categories...');
    const categories = await Category.insertMany([
      { name: 'Textbooks', description: 'Academic textbooks and course materials', icon: '📚' },
      { name: 'Electronics', description: 'Laptops, phones, tablets, and more', icon: '💻' },
      { name: 'Clothing', description: 'Apparel and accessories', icon: '👕' },
      { name: 'Furniture', description: 'Desks, chairs, and room essentials', icon: '🪑' }
    ]);
    console.log(`✅ Created ${categories.length} categories\n`);

    // Create users with hashed passwords
    // Note: insertMany bypasses Mongoose middleware, so we need to hash passwords manually
    console.log('👤 Creating users...');
    const password = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const users = await User.insertMany([
      {
        username: 'admin',
        email: 'admin@uon.edu',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        location: 'Admin Office',
        role: 'admin'
      },
      {
        username: 'johndoe',
        email: 'john@example.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        location: 'Campus Dorm'
      },
      {
        username: 'sarahm',
        email: 'sarah@example.com',
        password: hashedPassword,
        firstName: 'Sarah',
        lastName: 'Miller',
        location: 'Off-Campus'
      },
      {
        username: 'miket',
        email: 'mike@example.com',
        password: hashedPassword,
        firstName: 'Mike',
        lastName: 'Taylor',
        location: 'Student Union'
      },
      {
        username: 'emilyr',
        email: 'emily@example.com',
        password: hashedPassword,
        firstName: 'Emily',
        lastName: 'Roberts',
        location: 'Campus Dorm'
      }
    ]);
    console.log(`✅ Created ${users.length} users\n`);

    // Create products
    console.log('🛍️  Creating products...');
    const products = await Product.insertMany([
      {
        title: 'Calculus Textbook - 3rd Edition',
        description: 'Used but in excellent condition. No highlighting or notes.',
        price: 45.99,
        condition: 'Excellent',
        location: 'Campus Dorm',
        category: categories[0]._id,
        user: users[0]._id,
        images: [{ url: '📚', isPrimary: true }]
      },
      {
        title: 'MacBook Pro 13 inch 2020',
        description: 'M1 chip, 256GB SSD, 8GB RAM. Great condition, barely used.',
        price: 899.99,
        condition: 'Like New',
        location: 'Off-Campus',
        category: categories[1]._id,
        user: users[1]._id,
        images: [{ url: '💻', isPrimary: true }]
      },
      {
        title: 'Nike Air Max Sneakers Size 10',
        description: 'Gently worn, still in great shape. Original box included.',
        price: 65.00,
        condition: 'Good',
        location: 'Student Union',
        category: categories[2]._id,
        user: users[2]._id,
        images: [{ url: '👟', isPrimary: true }]
      },
      {
        title: 'Desk Chair - Office Style',
        description: 'Comfortable office chair. Adjustable height, good condition.',
        price: 35.00,
        condition: 'Good',
        location: 'Campus Dorm',
        category: categories[3]._id,
        user: users[3]._id,
        images: [{ url: '🪑', isPrimary: true }]
      },
      {
        title: 'iPhone 12 - 128GB',
        description: 'Unlocked, works perfectly. Minor scratches on screen. Includes charger.',
        price: 450.00,
        condition: 'Fair',
        location: 'Off-Campus',
        category: categories[1]._id,
        user: users[0]._id,
        images: [{ url: '📱', isPrimary: true }]
      },
      {
        title: 'Organic Chemistry Textbook Set',
        description: 'Complete set with study guide. Barely used, like new condition.',
        price: 85.00,
        condition: 'Excellent',
        location: 'Library',
        category: categories[0]._id,
        user: users[1]._id,
        images: [{ url: '📖', isPrimary: true }]
      },
      {
        title: 'Winter Jacket - Medium',
        description: 'North Face jacket, warm and waterproof. Perfect for winter.',
        price: 40.00,
        condition: 'Good',
        location: 'Campus Dorm',
        category: categories[2]._id,
        user: users[2]._id,
        images: [{ url: '🧥', isPrimary: true }]
      },
      {
        title: 'Study Desk with Drawers',
        description: 'Wooden desk with storage drawers. Easy to assemble.',
        price: 55.00,
        condition: 'Good',
        location: 'Off-Campus',
        category: categories[3]._id,
        user: users[3]._id,
        images: [{ url: '🪑', isPrimary: true }]
      }
    ]);
    console.log(`✅ Created ${products.length} products\n`);

    console.log('═══════════════════════════════════════════════════');
    console.log('   ✅ Database seeded successfully!');
    console.log('═══════════════════════════════════════════════════\n');
    console.log(`📊 Summary:`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Products: ${products.length}\n`);
    console.log('💡 Test accounts (password: password123):');
    console.log(`   👑 Admin: admin@uon.edu`);
    console.log(`   - john@example.com`);
    console.log(`   - sarah@example.com\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();

