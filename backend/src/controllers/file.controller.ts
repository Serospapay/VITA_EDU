import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import fs from 'fs';
import path from 'path';

// Upload files
export const uploadFiles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      throw new AppError('No files uploaded', 400);
    }

    const { courseId, lessonId } = req.body;

    // Create file records in database
    const fileRecords = await Promise.all(
      files.map((file) =>
        prisma.file.create({
          data: {
            name: file.filename,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            url: `/uploads/${file.filename}`,
            courseId: courseId || null,
            lessonId: lessonId || null,
            uploaderId: req.user!.id,
          },
        })
      )
    );

    res.status(201).json({
      success: true,
      data: fileRecords,
    });
  } catch (error) {
    next(error);
  }
};

// Get file by ID
export const getFileById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const file = await prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      throw new AppError('File not found', 404);
    }

    res.status(200).json({
      success: true,
      data: file,
    });
  } catch (error) {
    next(error);
  }
};

// Delete file
export const deleteFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const file = await prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      throw new AppError('File not found', 404);
    }

    // Delete file from filesystem
    // Parse the URL to get the actual file path
    const urlPath = file.url.replace('/uploads/', '');
    const filePath = path.join(__dirname, '../../uploads', urlPath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete file record from database
    await prisma.file.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get files by lesson
export const getFilesByLesson = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { lessonId } = req.params;

    const files = await prisma.file.findMany({
      where: { lessonId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: files,
    });
  } catch (error) {
    next(error);
  }
};

// Get files by course
export const getFilesByCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courseId } = req.params;

    const files = await prisma.file.findMany({
      where: { courseId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: files,
    });
  } catch (error) {
    next(error);
  }
};














