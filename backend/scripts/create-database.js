// Script to create database if it doesn't exist
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

async function createDatabase() {
  // Parse DATABASE_URL
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL not found in .env');
    process.exit(1);
  }

  const match = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
  if (!match) {
    console.error('❌ Could not parse DATABASE_URL');
    process.exit(1);
  }

  const [, user, password, host, port, dbName] = match;
  const postgresUrl = `postgresql://${user}:${password}@${host}:${port}/postgres`;

  console.log('🔌 Connecting to PostgreSQL...');
  console.log(`   Host: ${host}`);
  console.log(`   Port: ${port}`);
  console.log(`   User: ${user}`);
  console.log(`   Target Database: ${dbName}`);
  console.log('');

  try {
    // Connect to default postgres database
    const tempPrisma = new PrismaClient({
      datasources: {
        db: {
          url: postgresUrl,
        },
      },
    });

    await tempPrisma.$connect();
    console.log('✅ Connected to PostgreSQL');

    // Check if database exists
    const result = await tempPrisma.$queryRaw`
      SELECT 1 FROM pg_database WHERE datname = ${dbName}
    `;

    if (Array.isArray(result) && result.length > 0) {
      console.log(`✅ Database '${dbName}' already exists!`);
      await tempPrisma.$disconnect();
      process.exit(0);
    }

    // Create database
    console.log(`📦 Creating database '${dbName}'...`);
    
    // Note: Prisma doesn't support CREATE DATABASE directly
    // So we need to use raw SQL with template literal escaping
    await tempPrisma.$executeRawUnsafe(`CREATE DATABASE "${dbName}";`);
    
    console.log(`✅ Database '${dbName}' created successfully!`);
    
    await tempPrisma.$disconnect();

    // Now test connection to the new database
    console.log('');
    console.log('🔌 Testing connection to new database...');
    const mainPrisma = new PrismaClient();
    await mainPrisma.$connect();
    await mainPrisma.$queryRaw`SELECT 1`;
    await mainPrisma.$disconnect();
    
    console.log('✅ Connection to new database successful!');
    console.log('');
    console.log('💡 Next steps:');
    console.log('   1. Run migrations: cd backend && npx prisma migrate dev');
    console.log('   2. Seed database: npx prisma db seed');
    console.log('   3. Start server: npm run dev');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'P1000') {
      console.error('💡 Authentication failed. Check password in .env file');
    } else if (error.message.includes('already exists')) {
      console.log(`✅ Database '${dbName}' already exists!`);
    } else {
      console.error('💡 Full error:', error);
    }
    process.exit(1);
  }
}

createDatabase();


