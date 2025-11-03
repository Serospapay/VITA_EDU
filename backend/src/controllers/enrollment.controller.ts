import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

// Get user's enrollments
export const getMyEnrollments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { userId: req.user.id },
      include: {
        course: {
          include: {
            teacher: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
            category: true,
            _count: {
              select: {
                lessons: true,
                assignments: true,
              },
            },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    next(error);
  }
};

// Enroll in course
export const enrollInCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { courseId } = req.body;

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: req.user.id,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      throw new AppError('Already enrolled in this course', 400);
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: req.user.id,
        courseId,
      },
      include: {
        course: {
          include: {
            teacher: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    next(error);
  }
};

// Unenroll from course
export const unenrollFromCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { id } = req.params;

    const enrollment = await prisma.enrollment.delete({
      where: {
        id,
        userId: req.user.id,
      },
    });

    res.status(200).json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Enroll student in course
export const adminEnrollStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courseId, studentId } = req.body;

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: studentId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      throw new AppError('Student already enrolled in this course', 400);
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: studentId,
        courseId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Unenroll student from course
export const adminUnenrollStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const enrollment = await prisma.enrollment.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    next(error);
  }
};

// Get enrollments for a course (Teacher/Admin)
export const getCourseEnrollments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courseId } = req.params;

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            submissions: {
              where: {
                assignment: {
                  courseId: courseId,
                },
              },
              include: {
                assignment: {
                  select: {
                    id: true,
                    title: true,
                    maxScore: true,
                  },
                },
              },
              orderBy: { submittedAt: 'desc' },
            },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    next(error);
  }
};

