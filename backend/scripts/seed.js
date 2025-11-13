import dotenv from 'dotenv';
import { User, Category, Product, Message } from '../models/index.js';
import { connectDB } from '../config/database.js';
import sequelize from '../config/database.js';

dotenv.config();

/**
 * Seed database with initial data
 */
const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...\n');

    // Connect to database
    await connectDB();

    // Clear existing data using TRUNCATE CASCADE to handle foreign key constraints
    await sequelize.query('TRUNCATE TABLE messages, products, categories, users RESTART IDENTITY CASCADE');
    console.log('Cleared existing data\n');

    // Create categories
    console.log('Creating categories...');
    const categories = await Category.bulkCreate([
      { name: 'Textbooks', description: 'Academic textbooks and course materials' },
      { name: 'Electronics', description: 'Laptops, phones, tablets, and more' },
      { name: 'Clothing', description: 'Apparel and accessories' },
      { name: 'Furniture', description: 'Desks, chairs, and room essentials' }
    ]);
    console.log(`Created ${categories.length} categories\n`);

    // Create users
    console.log('Creating users...');
    const password = 'password123'; // Will be hashed by hooks
    const adminPassword = 'admin123'; // Admin password

    const users = await User.bulkCreate([
      {
        username: 'admin',
        email: 'admin@uon.edu',
        password: adminPassword, // Admin uses different password
        firstName: 'Admin',
        lastName: 'User',
        location: 'Admin Office',
        role: 'admin',
        emailVerified: true // Admin users don't need email verification
      },
      {
        username: 'johndoe',
        email: 'john@example.com',
        password: password,
        firstName: 'John',
        lastName: 'Doe',
        location: 'Campus Dorm',
        emailVerified: true // Seed users don't need email verification
      },
      {
        username: 'sarahm',
        email: 'sarah@example.com',
        password: password,
        firstName: 'Sarah',
        lastName: 'Miller',
        location: 'Off-Campus',
        emailVerified: true // Seed users don't need email verification
      },
      {
        username: 'miket',
        email: 'mike@example.com',
        password: password,
        firstName: 'Mike',
        lastName: 'Taylor',
        location: 'Student Union',
        emailVerified: true // Seed users don't need email verification
      },
      {
        username: 'emilyr',
        email: 'emily@example.com',
        password: password,
        firstName: 'Emily',
        lastName: 'Roberts',
        location: 'Campus Dorm',
        emailVerified: true // Seed users don't need email verification
      }
    ], {
      individualHooks: true // This ensures beforeCreate hooks run to hash passwords
    });
    console.log(`Created ${users.length} users\n`);

    // Create products
    console.log('Creating products...');
    const products = await Product.bulkCreate([
      {
        title: 'Calculus Textbook - 3rd Edition',
        description: 'Used but in excellent condition. No highlighting or notes.',
        price: 45.99,
        condition: 'Excellent',
        location: 'Campus Dorm',
        categoryId: categories[0].id,
        userId: users[0].id,
        images: [{ url: 'https://placehold.co/600x400', isPrimary: true }]
      },
      {
        title: 'MacBook Pro 13 inch 2020',
        description: 'M1 chip, 256GB SSD, 8GB RAM. Great condition, barely used.',
        price: 899.99,
        condition: 'Like New',
        location: 'Off-Campus',
        categoryId: categories[1].id,
        userId: users[1].id,
        images: [{ url: 'https://placehold.co/600x400', isPrimary: true }]
      },
      {
        title: 'Nike Air Max Sneakers Size 10',
        description: 'Gently worn, still in great shape. Original box included.',
        price: 65.00,
        condition: 'Good',
        location: 'Student Union',
        categoryId: categories[2].id,
        userId: users[2].id,
        images: [{ url: 'https://placehold.co/600x400', isPrimary: true }]
      },
      {
        title: 'Desk Chair - Office Style',
        description: 'Comfortable office chair. Adjustable height, good condition.',
        price: 35.00,
        condition: 'Good',
        location: 'Campus Dorm',
        categoryId: categories[3].id,
        userId: users[3].id,
        images: [{ url: 'https://placehold.co/600x400', isPrimary: true }]
      },
      {
        title: 'iPhone 12 - 128GB',
        description: 'Unlocked, works perfectly. Minor scratches on screen. Includes charger.',
        price: 450.00,
        condition: 'Fair',
        location: 'Off-Campus',
        categoryId: categories[1].id,
        userId: users[0].id,
        images: [{ url: 'https://placehold.co/600x400', isPrimary: true }]
      },
      {
        title: 'Organic Chemistry Textbook Set',
        description: 'Complete set with study guide. Barely used, like new condition.',
        price: 85.00,
        condition: 'Excellent',
        location: 'Library',
        categoryId: categories[0].id,
        userId: users[1].id,
        images: [{ url: 'https://placehold.co/600x400', isPrimary: true }]
      },
      {
        title: 'Winter Jacket - Medium',
        description: 'North Face jacket, warm and waterproof. Perfect for winter.',
        price: 40.00,
        condition: 'Good',
        location: 'Campus Dorm',
        categoryId: categories[2].id,
        userId: users[2].id,
        images: [{ url: 'https://placehold.co/600x400', isPrimary: true }]
      },
      {
        title: 'Study Desk with Drawers',
        description: 'Wooden desk with storage drawers. Easy to assemble.',
        price: 55.00,
        condition: 'Good',
        location: 'Off-Campus',
        categoryId: categories[3].id,
        userId: users[3].id,
        images: [{ url: 'https://placehold.co/600x400', isPrimary: true }]
      }
    ]);
    console.log(`Created ${products.length} products\n`);

    console.log('═══════════════════════════════════════════════════');
    console.log('   Database seeded successfully!');
    console.log('═══════════════════════════════════════════════════\n');
    console.log(`Summary:`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Products: ${products.length}\n`);
    console.log('Test accounts:');
    console.log(`   Admin: admin@uon.edu (password: admin123)`);
    console.log(`   - john@example.com (password: password123)`);
    console.log(`   - sarah@example.com (password: password123)`);
    console.log(`   - mike@example.com (password: password123)`);
    console.log(`   - emily@example.com (password: password123)\n`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();
