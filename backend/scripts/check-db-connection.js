// Quick script to test database connection
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔌 Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'NOT SET');
    
    if (process.env.DATABASE_URL) {
      const url = process.env.DATABASE_URL;
      const match = url.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
      if (match) {
        console.log(`   User: ${match[1]}`);
        console.log(`   Host: ${match[3]}`);
        console.log(`   Port: ${match[4]}`);
        console.log(`   Database: ${match[5]}`);
      }
    }
    
    await prisma.$connect();
    console.log('✅ Connection successful!');
    
    // Test query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Test query successful:', result);
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error('   Code:', error.code);
    console.error('   Message:', error.message);
    
    if (error.code === 'P1000') {
      console.error('\n💡 Authentication failed. Check username and password.');
    } else if (error.code === 'P1003') {
      console.error('\n💡 Database does not exist. Create it first.');
    }
    
    await prisma.$disconnect();
    process.exit(1);
  }
}

testConnection();


