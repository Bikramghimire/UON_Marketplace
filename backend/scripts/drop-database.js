import dotenv from 'dotenv';
import { connectDB } from '../config/database.js';
import sequelize from '../config/database.js';
import readline from 'readline';

dotenv.config();


const dropDatabase = async (dropAll = false) => {
  try {
        await connectDB();

        const [results] = await sequelize.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);

    const tables = results.map(row => row.tablename);

    if (tables.length === 0) {
      process.exit(0);
    }

    tables.forEach((table, index) => {
    });
    if (dropAll) {
            await sequelize.query('SET session_replication_role = replica;');
      
            for (const table of tables) {
        try {
          await sequelize.query(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
        } catch (error) {
        }
      }
      
            await sequelize.query('SET session_replication_role = DEFAULT;');
    } else {
      
            const truncateOrder = ['messages', 'products', 'categories', 'users'];
      const otherTables = tables.filter(t => !truncateOrder.includes(t));
      const orderedTables = [...truncateOrder.filter(t => tables.includes(t)), ...otherTables];
      
      for (const table of orderedTables) {
        try {
          await sequelize.query(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`);
        } catch (error) {
        }
      }
    }

    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
};


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


const main = async () => {
  const args = process.argv.slice(2);
  const dropAll = args.includes('--drop-all') || args.includes('-d');
  const force = args.includes('--force') || args.includes('-f');

  if (dropAll) {
  } else {
  }

  if (!force) {
    const confirmed = await askConfirmation();
    if (!confirmed) {
      process.exit(0);
    }
  }

  await dropDatabase(dropAll);
};

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default dropDatabase;

