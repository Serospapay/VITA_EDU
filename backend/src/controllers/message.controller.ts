import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

// Get messages for a course chat
export const getCourseMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { courseId } = req.params;
    const { limit = 50, before } = req.query;

    // Check if user is enrolled in course or is teacher
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { teacherId: true },
    });

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    const isTeacher = course.teacherId === req.user.id;
    const isEnrolled = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: req.user.id,
          courseId,
        },
      },
    });

    if (!isTeacher && !isEnrolled) {
      throw new AppError('You do not have access to this course chat', 403);
    }

    // Build query
    const where: any = {
      courseId,
    };

    if (before) {
      where.createdAt = {
        lt: new Date(before as string),
      };
    }

    const messages = await prisma.message.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
    });

    res.status(200).json({
      success: true,
      data: messages.reverse(), // Reverse to show oldest first
    });
  } catch (error) {
    next(error);
  }
};

// Send message to course chat
export const sendCourseMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { courseId } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === '') {
      throw new AppError('Message content is required', 400);
    }

    // Check if user is enrolled in course or is teacher
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { teacherId: true },
    });

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    const isTeacher = course.teacherId === req.user.id;
    const isEnrolled = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: req.user.id,
          courseId,
        },
      },
    });

    if (!isTeacher && !isEnrolled) {
      throw new AppError('You do not have access to this course chat', 403);
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId: req.user.id,
        courseId,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

// Get user's courses for chat (for teacher to switch between courses)
export const getMyCourseChats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    let courses;

    if (req.user.role === 'TEACHER') {
      // Get all courses where user is teacher
      courses = await prisma.course.findMany({
        where: { teacherId: req.user.id },
        select: {
          id: true,
          title: true,
          thumbnail: true,
          _count: {
            select: {
              enrollments: true,
              messages: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // Get all courses where user is enrolled
      const enrollments = await prisma.enrollment.findMany({
        where: { userId: req.user.id },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              thumbnail: true,
              _count: {
                select: {
                  enrollments: true,
                  lessons: true,
                  assignments: true,
                },
              },
            },
          },
        },
        orderBy: { enrolledAt: 'desc' },
      });

      courses = enrollments.map(e => e.course);
    }

    // Get unread message counts for each course
        const coursesWithUnread = await Promise.all(
      courses.map(async (course) => {
        if (!req.user) return { ...course, unreadMessages: 0 };
        
        const unreadCount = await prisma.message.count({
          where: {
            courseId: course.id,
            senderId: { not: req.user.id },
            isRead: false,
            receiverId: null, // Only course messages
          },
        });

        return {
          ...course,
          unreadMessages: unreadCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: coursesWithUnread,
    });
  } catch (error) {
    next(error);
  }
};

// Mark course messages as read
export const markCourseMessagesAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { courseId } = req.params;

    await prisma.message.updateMany({
      where: {
        courseId,
        senderId: { not: req.user.id },
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Messages marked as read',
    });
  } catch (error) {
    next(error);
  }
};







