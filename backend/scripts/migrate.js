import { sequelize } from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();


async function migrate() {
  try {
        await sequelize.authenticate();
        await sequelize.sync({ force: false, alter: true });
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

migrate();

