import { sequelize } from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Database Migration Script
 * Creates all tables in PostgreSQL
 */
async function migrate() {
  try {
    console.log('Starting database migration...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('Database connection established');

    // Sync all models (create tables)
    await sequelize.sync({ force: false, alter: true });
    console.log('All models synchronized successfully');

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();

