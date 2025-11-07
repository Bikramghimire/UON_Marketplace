/**
 * Create Admin User Script
 * Creates an admin user or promotes existing user to admin
 */

import dotenv from 'dotenv';
import { Op } from 'sequelize';
import { User } from '../models/index.js';
import { connectDB } from '../config/database.js';

dotenv.config();

/**
 * Create or update admin user
 */
const createAdmin = async () => {
  try {
    console.log('🚀 Creating admin user...\n');

    // Connect to database
    await connectDB();

    const email = 'admin@uon.edu';
    const username = 'admin';
    const password = 'admin123'; // Default admin password
    const firstName = 'Admin';
    const lastName = 'User';

    // Check if admin user already exists
    let adminUser = await User.findOne({ 
      where: {
        [Op.or]: [{ email }, { username }, { role: 'admin' }]
      }
    });

    if (adminUser) {
      // Update existing user to admin
      if (adminUser.role !== 'admin') {
        adminUser.role = 'admin';
        adminUser.email = email;
        adminUser.username = username;
        adminUser.firstName = firstName;
        adminUser.lastName = lastName;
        adminUser.password = password; // Will be hashed by hook
        adminUser.emailVerified = true; // Admin users don't need email verification
        await adminUser.save();
        console.log('✅ Existing user promoted to admin');
      } else {
        // Update password if needed
        adminUser.password = password;
        adminUser.firstName = firstName;
        adminUser.lastName = lastName;
        adminUser.emailVerified = true; // Ensure admin is verified
        await adminUser.save();
        console.log('✅ Admin user password updated');
      }
    } else {
      // Create new admin user
      adminUser = await User.create({
        username,
        email,
        password,
        firstName,
        lastName,
        location: 'Admin Office',
        role: 'admin',
        emailVerified: true // Admin users don't need email verification
      });
      console.log('✅ New admin user created');
    }

    console.log('\n═══════════════════════════════════════════════════');
    console.log('   ✅ Admin User Ready!');
    console.log('═══════════════════════════════════════════════════\n');
    console.log('📧 Login Credentials:');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Password: ${password}\n`);
    console.log('💡 You can now login at: http://localhost:3000/login\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

// Run script
createAdmin();
