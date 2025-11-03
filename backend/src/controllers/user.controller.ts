import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

// Get all users (admin only)
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { role, status, search, page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};

    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatar: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          enrollments: {
            select: {
              courseId: true,
              course: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get user by ID
export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        bio: true,
        phone: true,
        dateOfBirth: true,
        emailVerified: true,
        requestedCourseId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Fetch requested course if exists
    let requestedCourse = null;
    if (user?.requestedCourseId) {
      requestedCourse = await prisma.course.findUnique({
        where: { id: user.requestedCourseId },
        select: {
          id: true,
          title: true,
        },
      });
    }

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: {
        ...user,
        requestedCourse,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { id } = req.params;
    const { firstName, lastName, bio, phone, dateOfBirth, role } = req.body;

    // Check permission
    if (req.user.id !== id && req.user.role !== 'ADMIN') {
      throw new AppError('You do not have permission to update this profile', 403);
    }

    // Only admin can change role
    const updateData: any = {
      firstName,
      lastName,
      bio,
      phone,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
    };

    // Allow role update only for admins
    if (req.user.role === 'ADMIN' && role) {
      updateData.role = role;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        bio: true,
        phone: true,
        dateOfBirth: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Delete user (admin only)
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get user statistics
export const getUserStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const [enrollments, submittedCount, quizAttempts, completedAssignments, pendingAssignments] = await Promise.all([
      prisma.enrollment.count({ where: { userId: id } }),
      prisma.submission.count({ 
        where: { 
          userId: id,
          submittedAt: { not: null },
        } 
      }),
      prisma.quizAttempt.count({ where: { userId: id } }),
      prisma.submission.count({
        where: {
          userId: id,
          status: 'GRADED',
        },
      }),
      prisma.submission.count({
        where: {
          userId: id,
          status: 'PENDING',
        },
      }),
    ]);

    // Calculate average grade from graded submissions
    const avgGrade = await prisma.submission.aggregate({
      where: { 
        userId: id,
        status: 'GRADED',
        score: { not: null },
      },
      _avg: { score: true },
    });

    res.status(200).json({
      success: true,
      data: {
        enrollments,
        submissions: submittedCount,
        quizAttempts,
        averageGrade: avgGrade._avg.score || 0,
        completedAssignments,
        pendingAssignments,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Verify user email (admin only)
export const verifyUserEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Get user with requested course
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: {
        requestedCourseId: true,
      },
    });

    // Update user and verify email
    const user = await prisma.user.update({
      where: { id },
      data: { emailVerified: true },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        requestedCourseId: true,
      },
    });

    // Auto-enroll in requested course if exists
    if (existingUser?.requestedCourseId) {
      try {
        // Check if already enrolled
        const existingEnrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: id,
              courseId: existingUser.requestedCourseId,
            },
          },
        });

        // Create enrollment if not exists
        if (!existingEnrollment) {
          await prisma.enrollment.create({
            data: {
              userId: id,
              courseId: existingUser.requestedCourseId,
            },
          });

          // Clear requestedCourseId after successful enrollment
          await prisma.user.update({
            where: { id },
            data: { requestedCourseId: null },
          });
        }
      } catch (enrollError) {
        // Log error but don't fail verification
        console.error('Auto-enrollment error:', enrollError);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

