import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

// Get all courses
export const getCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      status,
      level,
      categoryId,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};

    if (status) where.status = status;
    if (level) where.level = level;
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
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
          enrollments: {
            select: {
              progress: true,
              completedAt: true,
            },
          },
          _count: {
            select: {
              enrollments: true,
              lessons: true,
            },
          },
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.course.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        courses,
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

// Get course by ID or slug
export const getCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            bio: true,
          },
        },
        category: true,
        lessons: {
          select: {
            id: true,
            title: true,
            slug: true,
            type: true,
            duration: true,
            order: true,
            isPublished: true,
            isFree: true,
          },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            enrollments: true,
            assignments: true,
            quizzes: true,
          },
        },
      },
    });

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

// Create course (teacher/admin only)
export const createCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const {
      title,
      slug,
      description,
      shortDesc,
      thumbnail,
      status,
      level,
      duration,
      price,
      maxStudents,
      startDate,
      endDate,
      categoryId,
      teacherId, // For admins to assign a teacher
    } = req.body;

    // If admin provides teacherId, use it; otherwise use current user's ID
    const finalTeacherId = teacherId || req.user.id;

    const course = await prisma.course.create({
      data: {
        title,
        slug,
        description,
        shortDesc,
        thumbnail,
        status,
        level,
        duration,
        price,
        maxStudents,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        teacherId: finalTeacherId,
        categoryId,
      },
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
      },
    });

    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

// Update course
export const updateCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { id } = req.params;

    // Check if user owns the course or is admin
    const existingCourse = await prisma.course.findUnique({
      where: { id },
    });

    if (!existingCourse) {
      throw new AppError('Course not found', 404);
    }

    if (
      existingCourse.teacherId !== req.user.id &&
      req.user.role !== 'ADMIN'
    ) {
      throw new AppError('You do not have permission to update this course', 403);
    }

    const course = await prisma.course.update({
      where: { id },
      data: req.body,
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
      },
    });

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

// Delete course
export const deleteCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { id } = req.params;

    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    if (course.teacherId !== req.user.id && req.user.role !== 'ADMIN') {
      throw new AppError('You do not have permission to delete this course', 403);
    }

    await prisma.course.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get courses by teacher
export const getTeacherCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { teacherId } = req.params;

    const courses = await prisma.course.findMany({
      where: { teacherId },
      include: {
        category: true,
        _count: {
          select: {
            enrollments: true,
            lessons: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error) {
    next(error);
  }
};

// Get enrolled students
export const getCourseStudents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
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

