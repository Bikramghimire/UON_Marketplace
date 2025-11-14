import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';
import { connectDB } from '../config/database.js';
import sequelize from '../config/database.js';

dotenv.config();


const fixPasswords = async () => {
  try {
        await connectDB();

        const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'password']
    });
    let fixedCount = 0;

    for (const user of users) {
      const password = user.password;
      
            const isHashed = password && (
        password.startsWith('$2a$') ||
        password.startsWith('$2b$') ||
        password.startsWith('$2y$')
      );

      if (!isHashed) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);
        
        await user.update({ password: hashedPassword });
        fixedCount++;
      } else {
      }
    }
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
};

fixPasswords();

