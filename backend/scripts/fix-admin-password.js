import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';
import { connectDB } from '../config/database.js';

dotenv.config();

/**
 * Fix admin password to admin123
 */
const fixAdminPassword = async () => {
  try {
    console.log('Fixing admin password...\n');

    // Connect to database
    await connectDB();

    const email = 'admin@uon.edu';
    const username = 'admin';
    const newPassword = 'admin123';

    // Find admin user
    const adminUser = await User.findOne({
      where: {
        email: email
      },
      attributes: { include: ['password'] }
    });

    if (!adminUser) {
      console.log('Admin user not found. Creating new admin user...');
      
      // Create admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      const newAdmin = await User.create({
        username: username,
        email: email,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        location: 'Admin Office',
        role: 'admin',
        emailVerified: true
      });
      
      console.log('Admin user created');
      console.log(`   Email: ${newAdmin.email}`);
      console.log(`   Password: ${newPassword}\n`);
    } else {
      // Update password
      console.log(`Found admin user: ${adminUser.email}`);
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      adminUser.password = hashedPassword;
      adminUser.emailVerified = true; // Ensure admin is verified
      adminUser.role = 'admin'; // Ensure role is admin
      await adminUser.save();
      
      console.log('Admin password updated');
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Password: ${newPassword}\n`);
    }

    console.log('═══════════════════════════════════════════════════');
    console.log('   Admin password fixed!');
    console.log('═══════════════════════════════════════════════════\n');
    console.log('Login Credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${newPassword}\n`);

    process.exit(0);
  } catch (error) {
    console.error('Error fixing admin password:', error);
    process.exit(1);
  }
};

// Run password fix
fixAdminPassword();

