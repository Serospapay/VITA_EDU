import { createClient } from 'redis';
import { logger } from '../utils/logger';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

let isRedisConnected = false;

redisClient.on('error', (err) => {
  logger.warn('Redis Client Error (Redis is optional):', err.message);
  isRedisConnected = false;
});

redisClient.on('connect', () => {
  logger.info('✅ Redis Client Connected');
  isRedisConnected = true;
});

export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error: any) {
    logger.warn('⚠️  Redis not available, continuing without caching');
    logger.warn('To enable Redis, install Memurai: https://www.memurai.com/');
    isRedisConnected = false;
  }
};

export const disconnectRedis = async () => {
  if (redisClient.isOpen) {
    await redisClient.quit();
  }
};

export const getRedisClient = () => {
  return isRedisConnected ? redisClient : null;
};

export default redisClient;

