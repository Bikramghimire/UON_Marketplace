import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Testing database connection...');
console.log('📋 Configuration:');
console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
console.log(`   Port: ${process.env.DB_PORT || '5432'}`);
console.log(`   Database: ${process.env.DB_NAME || 'uon_marketplace'}`);
console.log(`   User: ${process.env.DB_USER || 'postgres'}`);
console.log('');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.on('connection', (client) => {
    console.log('Connected to the database');
});
pool.on('error', (err) => {
    console.error('Error in the database', err);
});

// 
 /* Test the connection
 */
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error testing the database', err);
    } else {
        console.log('Database is connected');
    }
});

export default pool;




// Test the connection
async function testConnection() {
    try {
        console.log('🔄 Attempting to connect...');
        const client = await pool.connect();
        
        console.log('✅ Successfully connected to the database!');
        
        // Test a simple query
        const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
        console.log('📊 Database Info:');
        console.log(`   Current Time: ${result.rows[0].current_time}`);
        console.log(`   PostgreSQL Version: ${result.rows[0].postgres_version.split(' ')[0]}`);
        
        // Test database and user info
        const dbInfo = await client.query(`
            SELECT 
                current_database() as database_name,
                current_user as user_name,
                inet_server_addr() as server_ip,
                inet_server_port() as server_port
        `);
        
        console.log('🔧 Connection Details:');
        console.log(`   Database: ${dbInfo.rows[0].database_name}`);
        console.log(`   User: ${dbInfo.rows[0].user_name}`);
        console.log(`   Server IP: ${dbInfo.rows[0].server_ip || 'localhost'}`);
        console.log(`   Server Port: ${dbInfo.rows[0].server_port}`);
        
        client.release();
        console.log('✅ Database connection test completed successfully!');
        
    } catch (error) {
        console.error('❌ Database connection failed:');
        console.error(`   Error: ${error.message}`);
        console.error(`   Code: ${error.code}`);
        
        if (error.code === 'ECONNREFUSED') {
            console.error('💡 Suggestion: Make sure PostgreSQL is running on your system');
        } else if (error.code === '28P01') {
            console.error('💡 Suggestion: Check your username and password in the .env file');
        } else if (error.code === '3D000') {
            console.error('💡 Suggestion: The database does not exist. Create it first.');
        }
    } finally {
        await pool.end();
        console.log('🔌 Connection pool closed');
    }
}

testConnection();