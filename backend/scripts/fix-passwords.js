import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';
import { connectDB } from '../config/database.js';
import sequelize from '../config/database.js';

dotenv.config();

/**
 * Fix passwords for existing users - hash them if they're plain text
 */
const fixPasswords = async () => {
  try {
    console.log('Fixing user passwords...\n');

    // Connect to database
    await connectDB();

    // Get all users
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'password']
    });

    console.log(`Found ${users.length} users\n`);

    let fixedCount = 0;

    for (const user of users) {
      const password = user.password;
      
      // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
      const isHashed = password && (
        password.startsWith('$2a$') ||
        password.startsWith('$2b$') ||
        password.startsWith('$2y$')
      );

      if (!isHashed) {
        // Password is plain text, hash it
        console.log(`Hashing password for user: ${user.username} (${user.email})`);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);
        
        await user.update({ password: hashedPassword });
        fixedCount++;
      } else {
        console.log(`Password already hashed for user: ${user.username} (${user.email})`);
      }
    }

    console.log('\n═══════════════════════════════════════════════════');
    console.log(`   Fixed ${fixedCount} user passwords`);
    console.log('═══════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('Error fixing passwords:', error);
    process.exit(1);
  }
};

// Run password fix
fixPasswords();

