/**
 * Password Hashing Script
 * Use this to generate properly hashed passwords for seed data
 */

import bcrypt from 'bcryptjs';

const testPassword = 'password123'; // Default test password for all users
const saltRounds = 10;

async function hashPasswords() {
  console.log('Generating hashed passwords for seed data...\n');
  
  const hashedPassword = await bcrypt.hash(testPassword, saltRounds);
  
  console.log('✅ Password hash generated:');
  console.log(`   Password: ${testPassword}`);
  console.log(`   Hash: ${hashedPassword}\n`);
  console.log('📝 Copy this hash to seed.sql file for all test users');
  console.log('⚠️  Note: All test users will use password: "password123"');
}

hashPasswords().catch(console.error);
