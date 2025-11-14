

import dotenv from 'dotenv';
import { Op } from 'sequelize';
import { User } from '../models/index.js';
import { connectDB } from '../config/database.js';

dotenv.config();


const createAdmin = async () => {
  try {
        await connectDB();

    const email = 'admin@uon.edu';
    const username = 'admin';
    const password = 'admin123';     const firstName = 'Admin';
    const lastName = 'User';

        let adminUser = await User.findOne({ 
      where: {
        [Op.or]: [{ email }, { username }, { role: 'admin' }]
      }
    });

    if (adminUser) {
            if (adminUser.role !== 'admin') {
        adminUser.role = 'admin';
        adminUser.email = email;
        adminUser.username = username;
        adminUser.firstName = firstName;
        adminUser.lastName = lastName;
        adminUser.password = password;         adminUser.emailVerified = true;         await adminUser.save();
      } else {
                adminUser.password = password;
        adminUser.firstName = firstName;
        adminUser.lastName = lastName;
        adminUser.emailVerified = true;         await adminUser.save();
      }
    } else {
            adminUser = await User.create({
        username,
        email,
        password,
        firstName,
        lastName,
        location: 'Admin Office',
        role: 'admin',
        emailVerified: true       });
    }
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
};

createAdmin();
