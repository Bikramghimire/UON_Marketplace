import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';
import { connectDB } from '../config/database.js';

dotenv.config();


const fixAdminPassword = async () => {
  try {
        await connectDB();

    const email = 'admin@uon.edu';
    const username = 'admin';
    const newPassword = 'admin123';

        const adminUser = await User.findOne({
      where: {
        email: email
      },
      attributes: { include: ['password'] }
    });

    if (!adminUser) {
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
    } else {
            const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      adminUser.password = hashedPassword;
      adminUser.emailVerified = true;       adminUser.role = 'admin';       await adminUser.save();
    }
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
};

fixAdminPassword();

