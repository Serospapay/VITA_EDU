import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

// Get lesson by ID
export const getLessonById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        files: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!lesson) {
      throw new AppError('Lesson not found', 404);
    }

    res.status(200).json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    next(error);
  }
};

// Get lessons by course ID
export const getLessonsByCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courseId } = req.params;

    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
    });

    res.status(200).json({
      success: true,
      data: lessons,
    });
  } catch (error) {
    next(error);
  }
};

// Create lesson (teacher/admin only)
export const createLesson = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { courseId } = req.params;
    const {
      title,
      slug,
      content,
      videoUrl,
      duration,
      order,
      type,
      isPublished,
      isFree,
    } = req.body;

    const lesson = await prisma.lesson.create({
      data: {
        title,
        slug,
        content,
        videoUrl,
        duration,
        order,
        type,
        isPublished,
        isFree,
        courseId,
      },
    });

    res.status(201).json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    next(error);
  }
};

// Update lesson
export const updateLesson = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const lesson = await prisma.lesson.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    next(error);
  }
};

// Delete lesson
export const deleteLesson = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    await prisma.lesson.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Lesson deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

