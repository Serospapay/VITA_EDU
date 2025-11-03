import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { AppError } from './errorHandler';
import { Role } from '@prisma/client';
import prisma from '../config/database';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload & { role: Role };
    }
  }
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = verifyAccessToken(token);

    // Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      throw new AppError('User no longer exists', 401);
    }

    if (user.status !== 'ACTIVE') {
      throw new AppError('User account is not active', 401);
    }

    // Attach user to request
    req.user = {
      ...decoded,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Invalid or expired token', 401));
    }
  }
};

// Authorization middleware for role-based access
export const authorize = (...roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

// Check if user is teacher or admin
export const isTeacherOrAdmin = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('User not authenticated', 401));
  }

  if (req.user.role !== Role.TEACHER && req.user.role !== Role.ADMIN) {
    return next(new AppError('Only teachers and admins can perform this action', 403));
  }

  next();
};

// Check if user is admin
export const isAdmin = authorize(Role.ADMIN);

// Check if user owns resource or is admin
export const isOwnerOrAdmin = async (
  req: Request,
  _res: Response,
  next: NextFunction,
  resourceId: string,
  resourceType: 'user' | 'course' | 'submission'
) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    // Admin can access everything
    if (req.user.role === Role.ADMIN) {
      return next();
    }

    // Check ownership based on resource type
    let isOwner = false;

    switch (resourceType) {
      case 'user':
        isOwner = req.user.id === resourceId;
        break;
      case 'course':
        const course = await prisma.course.findUnique({
          where: { id: resourceId },
          select: { teacherId: true },
        });
        isOwner = course?.teacherId === req.user.id;
        break;
      case 'submission':
        const submission = await prisma.submission.findUnique({
          where: { id: resourceId },
          select: { userId: true },
        });
        isOwner = submission?.userId === req.user.id;
        break;
    }

    if (!isOwner) {
      throw new AppError('You do not have permission to access this resource', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};











