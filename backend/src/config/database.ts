import dotenv from 'dotenv';
import path from 'path';

// Завантажити .env ПЕРЕД створенням PrismaClient
// Try to load from backend/.env first, then from root/.env
const envPath = path.join(__dirname, '../.env');
const rootEnvPath = path.join(__dirname, '../../.env');

dotenv.config({ path: envPath });
dotenv.config({ path: rootEnvPath, override: false }); // Don't override if already loaded

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

// Log database queries in development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    logger.debug('Query: ' + e.query);
    logger.debug('Duration: ' + e.duration + 'ms');
  });
}

prisma.$on('warn', (e) => {
  logger.warn('Prisma Warning:', e);
});

// Handle database connection loss and reconnect
prisma.$on('error', async (e: any) => {
  logger.error('Prisma Error:', e);
  
  // Check if it's a connection error
  if (e.code === 'P1001' || e.code === 'P1002' || e.code === 'P1003') {
    logger.warn('🔄 Database connection lost, attempting to reconnect...');
    
    // Attempt to reconnect
    try {
      await prisma.$disconnect();
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      await prisma.$connect();
      logger.info('✅ Database reconnected successfully');
    } catch (reconnectError) {
      logger.error('❌ Failed to reconnect to database:', reconnectError);
    }
  }
});

// Test database connection
export const connectDatabase = async () => {
  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      const errorMsg = 'DATABASE_URL is not set in environment variables. Please check your .env file.';
      logger.error('❌ ' + errorMsg);
      throw new Error(errorMsg);
    }

    logger.info('🔌 Attempting to connect to database...');
    const urlMatch = process.env.DATABASE_URL?.match(/postgresql:\/\/[^:]+:[^@]+@[^\/]+/);
    logger.debug('Database URL format: ' + (urlMatch ? 'Valid format' : 'Check format'));
    
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
    
    // Test query
    await prisma.$queryRaw`SELECT 1`;
    logger.info('✅ Database connection verified');
    
    return true;
  } catch (error: any) {
    logger.error('❌ Database connection failed');
    logger.error(`Error code: ${error.code || 'UNKNOWN'}`);
    
    // Parse DATABASE_URL for better error messages (without showing password)
    const dbUrl = process.env.DATABASE_URL || '';
    const urlMatch = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
    
    // Provide helpful error messages
    if (error.code === 'ECONNREFUSED') {
      logger.error('❌ Connection refused. Is PostgreSQL running?');
      logger.error('💡 Check if PostgreSQL service is started');
    } else if (error.code === 'ENOTFOUND') {
      logger.error('❌ Database host not found. Check DATABASE_URL hostname');
      if (urlMatch) logger.error(`   Host: ${urlMatch[3]}`);
    } else if (error.code === 'P1001') {
      logger.error('❌ Cannot reach database server. Is PostgreSQL running on the specified port?');
      if (urlMatch) logger.error(`   Host: ${urlMatch[3]}, Port: ${urlMatch[4]}`);
    } else if (error.code === 'P1000') {
      logger.error('❌ Authentication failed. Check database username and password in DATABASE_URL');
      if (urlMatch) {
        logger.error(`   Username: ${urlMatch[1]}`);
        logger.error(`   Database: ${urlMatch[5]}`);
        logger.error('   💡 Verify password is correct and user exists in PostgreSQL');
      }
    } else if (error.code === 'P1003') {
      logger.error('❌ Database does not exist. Create it first or check DATABASE_URL');
      if (urlMatch) {
        logger.error(`   Database name: ${urlMatch[5]}`);
        logger.error('   💡 Create database with: CREATE DATABASE ' + urlMatch[5] + ';');
      }
    } else if (error.message?.includes('Authentication failed')) {
      logger.error('❌ Authentication failed');
      if (urlMatch) {
        logger.error(`   Username: ${urlMatch[1]}`);
        logger.error(`   Database: ${urlMatch[5]}`);
        logger.error('   💡 Possible issues:');
        logger.error('      - Wrong password');
        logger.error('      - User does not exist');
        logger.error('      - Database does not exist');
        logger.error('   💡 To create database:');
        logger.error(`      psql -U postgres -c "CREATE DATABASE ${urlMatch[5]};"`);
      }
    }
    
    logger.error('Error details:', error.message || error);
    logger.error('DATABASE_URL format check:', dbUrl ? 'Set (check format: postgresql://user:pass@host:port/db)' : 'NOT SET');
    throw error;
  }
};

// Disconnect database
export const disconnectDatabase = async () => {
  try {
    await prisma.$disconnect();
    logger.info('✅ Database disconnected');
  } catch (error) {
    logger.error('❌ Error disconnecting from database:', error);
    throw error;
  }
};

export default prisma;





