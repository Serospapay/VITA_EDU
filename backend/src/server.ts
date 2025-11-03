import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root (backend/.env) or parent root (.env)
const envPath = path.join(__dirname, '../.env');
const rootEnvPath = path.join(__dirname, '../../.env');

// Try to load from backend/.env first, then from root/.env
dotenv.config({ path: envPath });
dotenv.config({ path: rootEnvPath, override: false }); // Don't override if already loaded

import { createServer } from 'http';
import app from './app';
import { logger } from './utils/logger';
import { connectRedis } from './config/redis';
import { connectDatabase, disconnectDatabase } from './config/database';
import { initializeSocket } from './socket';

const PORT = Number(process.env.PORT) || 5000;

// Global error handlers - MUST be set before anything else
process.on('uncaughtException', (error: Error) => {
  logger.error('💥 UNCAUGHT EXCEPTION! Server will restart...', {
    error: error.message,
    stack: error.stack,
  });
  // Give time for logger to write
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

process.on('unhandledRejection', (reason: unknown) => {
  logger.error('💥 UNHANDLED REJECTION! Server will restart...', {
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
  });
  // Give time for logger to write
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// Handle process warnings
process.on('warning', (warning) => {
  logger.warn('⚠️ Process Warning:', {
    name: warning.name,
    message: warning.message,
    stack: warning.stack,
  });
});

async function startServer() {
  try {
    // Connect to database (required)
    logger.info('🔌 Connecting to database...');
    await connectDatabase();
    
    // Try to connect to Redis (optional)
    await connectRedis();

    // Create HTTP server
    const httpServer = createServer(app);

    // Initialize Socket.io
    initializeSocket(httpServer);
    logger.info('✅ WebSocket server initialized');

    // Start server - listen on all interfaces (0.0.0.0) to allow network access
    const HOST = process.env.HOST || '0.0.0.0';
    const server = httpServer.listen(PORT, HOST, () => {
      logger.info(`🚀 Server running on http://${HOST}:${PORT}`);
      logger.info(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`📖 API Docs: http://${HOST}:${PORT}/api-docs`);
      logger.info(`🌐 Accessible from network at http://<your-ip>:${PORT}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully`);
      server.close(async () => {
        logger.info('HTTP server closed');
        try {
          await disconnectDatabase();
          logger.info('Database disconnected');
        } catch (error) {
          logger.error('Error during database disconnection:', error);
        }
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      switch (error.code) {
        case 'EACCES':
          logger.error(`❌ Port ${PORT} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          logger.error(`❌ Port ${PORT} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();







