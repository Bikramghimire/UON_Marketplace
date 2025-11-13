import dotenv from 'dotenv';
import { connectDB } from '../config/database.js';
import sequelize from '../config/database.js';
import readline from 'readline';

dotenv.config();

/**
 * Drop all tables from the database
 */
const dropDatabase = async (dropAll = false) => {
  try {
    console.log('Starting database deletion...\n');

    // Connect to database
    await connectDB();

    // Get all table names
    const [results] = await sequelize.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);

    const tables = results.map(row => row.tablename);

    if (tables.length === 0) {
      console.log('No tables found in the database.\n');
      process.exit(0);
    }

    console.log(`Found ${tables.length} table(s):`);
    tables.forEach((table, index) => {
      console.log(`  ${index + 1}. ${table}`);
    });
    console.log('');

    if (dropAll) {
      // Drop all tables with CASCADE to handle foreign keys
      console.log('Dropping all tables...\n');
      
      // Disable foreign key checks temporarily
      await sequelize.query('SET session_replication_role = replica;');
      
      // Drop all tables
      for (const table of tables) {
        try {
          await sequelize.query(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
          console.log(`  Dropped table: ${table}`);
        } catch (error) {
          console.error(`  Error dropping table ${table}:`, error.message);
        }
      }
      
      // Re-enable foreign key checks
      await sequelize.query('SET session_replication_role = DEFAULT;');
      
      console.log('\n═══════════════════════════════════════════════════');
      console.log('   All tables dropped successfully!');
      console.log('═══════════════════════════════════════════════════\n');
    } else {
      // Truncate all tables (keep structure, delete data)
      console.log('Truncating all tables (keeping structure)...\n');
      
      // Truncate in correct order to handle foreign keys
      const truncateOrder = ['messages', 'products', 'categories', 'users'];
      const otherTables = tables.filter(t => !truncateOrder.includes(t));
      const orderedTables = [...truncateOrder.filter(t => tables.includes(t)), ...otherTables];
      
      for (const table of orderedTables) {
        try {
          await sequelize.query(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`);
          console.log(`  Truncated table: ${table}`);
        } catch (error) {
          console.error(`  Error truncating table ${table}:`, error.message);
        }
      }
      
      console.log('\n═══════════════════════════════════════════════════');
      console.log('   All tables truncated successfully!');
      console.log('   (Table structures preserved)');
      console.log('═══════════════════════════════════════════════════\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error deleting database:', error);
    process.exit(1);
  }
};

/**
 * Interactive confirmation prompt
 */
const askConfirmation = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('WARNING: This will delete all data. Are you sure? (yes/no): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
};

/**
 * Main execution
 */
const main = async () => {
  const args = process.argv.slice(2);
  const dropAll = args.includes('--drop-all') || args.includes('-d');
  const force = args.includes('--force') || args.includes('-f');

  if (dropAll) {
    console.log('WARNING: This will DROP all tables (delete structure and data)!\n');
  } else {
    console.log('WARNING: This will TRUNCATE all tables (delete data, keep structure)!\n');
  }

  if (!force) {
    const confirmed = await askConfirmation();
    if (!confirmed) {
      console.log('\nOperation cancelled.\n');
      process.exit(0);
    }
  }

  await dropDatabase(dropAll);
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default dropDatabase;

