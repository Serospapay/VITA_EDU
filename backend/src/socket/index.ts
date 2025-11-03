import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import { logger } from '../utils/logger';
import prisma from '../config/database';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export const initializeSocket = (httpServer: HTTPServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // Allow requests with no origin
        if (!origin) return callback(null, true);
        
        // Allow localhost and local network IPs
        const allowedOrigins = [
          'http://localhost:3000',
          'http://127.0.0.1:3000',
          process.env.CORS_ORIGIN,
          process.env.FRONTEND_URL,
        ].filter(Boolean);
        
        // Check if origin matches local network pattern
        const isLocalNetwork = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/.test(origin);
        
        if (allowedOrigins.includes(origin) || isLocalNetwork) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    },
  });

  // Authentication middleware
  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = verifyAccessToken(token);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`User connected: ${socket.userId}`);

    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // Join course rooms
    socket.on('join:course', (courseId: string) => {
      socket.join(`course:${courseId}`);
      logger.info(`User ${socket.userId} joined course ${courseId}`);
    });

    // Leave course room
    socket.on('leave:course', (courseId: string) => {
      socket.leave(`course:${courseId}`);
      logger.info(`User ${socket.userId} left course ${courseId}`);
    });

    // Send course chat message
    socket.on('course:message:send', async (data: {
      courseId: string;
      content: string;
    }) => {
      try {
        // Verify user has access to this course
        const course = await prisma.course.findUnique({
          where: { id: data.courseId },
          select: { teacherId: true },
        });

        if (!course) {
          socket.emit('error', { message: 'Course not found' });
          return;
        }

        const isTeacher = course.teacherId === socket.userId;
        const isEnrolled = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: socket.userId!,
              courseId: data.courseId,
            },
          },
        });

        if (!isTeacher && !isEnrolled) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        // Get sender info
        const sender = await prisma.user.findUnique({
          where: { id: socket.userId! },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        });

        if (!sender) {
          socket.emit('error', { message: 'User not found' });
          return;
        }

        // Save message to database
        const message = await prisma.message.create({
          data: {
            content: data.content.trim(),
            senderId: socket.userId!,
            courseId: data.courseId,
            isRead: false,
          },
        });

        // Emit to all users in course room
        const messageData = {
          ...message,
          sender,
        };

        io.to(`course:${data.courseId}`).emit('course:message:received', messageData);

        // Confirm to sender
        socket.emit('course:message:sent', messageData);
      } catch (error) {
        logger.error('Error sending course message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Send private message (legacy, for backward compatibility)
    socket.on('message:send', async (data: {
      receiverId: string;
      content: string;
    }) => {
      try {
        // Here you would save the message to database
        // For now, just emit to receiver
        io.to(`user:${data.receiverId}`).emit('message:received', {
          senderId: socket.userId,
          content: data.content,
          timestamp: new Date(),
        });

        // Confirm to sender
        socket.emit('message:sent', {
          receiverId: data.receiverId,
          content: data.content,
          timestamp: new Date(),
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing:start', (receiverId: string) => {
      io.to(`user:${receiverId}`).emit('typing:user', {
        userId: socket.userId,
        isTyping: true,
      });
    });

    socket.on('typing:stop', (receiverId: string) => {
      io.to(`user:${receiverId}`).emit('typing:user', {
        userId: socket.userId,
        isTyping: false,
      });
    });

    // Course announcements (teacher only)
    socket.on('announcement:send', (data: {
      courseId: string;
      title: string;
      content: string;
    }) => {
      if (socket.userRole === 'TEACHER' || socket.userRole === 'ADMIN') {
        io.to(`course:${data.courseId}`).emit('announcement:received', {
          title: data.title,
          content: data.content,
          timestamp: new Date(),
        });
      }
    });

    // Notifications
    socket.on('notification:send', (data: {
      userId: string;
      title: string;
      message: string;
    }) => {
      io.to(`user:${data.userId}`).emit('notification:received', {
        title: data.title,
        message: data.message,
        timestamp: new Date(),
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

export default initializeSocket;







