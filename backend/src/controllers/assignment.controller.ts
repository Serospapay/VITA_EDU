import { Request, Response, NextFunction } from 'express';
import { AssignmentType } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import prisma from '../config/database';

interface QuestionData {
  text: string;
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'LONG_ANSWER';
  points: number;
  order: number;
  explanation?: string;
  options?: {
    text: string;
    isCorrect: boolean;
    order: number;
  }[];
}

// Get assignments for a course with student's submission status
export const getCourseAssignments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courseId } = req.params;

    // Check if user has access to this course (enrolled or teacher)
    const isTeacher = await prisma.course.findFirst({
      where: {
        id: courseId,
        teacherId: req.user!.id,
      },
    });

    const isEnrolled = await prisma.enrollment.findFirst({
      where: {
        userId: req.user!.id,
        courseId,
      },
    });

    const isAdmin = req.user?.role === 'ADMIN';

    if (!isTeacher && !isEnrolled && !isAdmin) {
      throw new AppError('You do not have access to this course', 403);
    }

    // Get assignments
    const assignments = await prisma.assignment.findMany({
      where: { courseId },
      orderBy: { createdAt: 'desc' },
    });

    // If student, add their submission status to each assignment
    if (isEnrolled && !isTeacher && !isAdmin) {
      const assignmentsWithSubmissions = await Promise.all(
        assignments.map(async (assignment) => {
          const submission = await prisma.submission.findFirst({
            where: {
              assignmentId: assignment.id,
              userId: req.user!.id,
            },
            select: {
              id: true,
              content: true,
              files: true,
              githubUrl: true,
              status: true,
              score: true,
              feedback: true,
              submittedAt: true,
              gradedAt: true,
            },
          });

          return {
            ...assignment,
            mySubmission: submission || null,
          };
        })
      );

      return res.status(200).json({
        success: true,
        data: assignmentsWithSubmissions,
      });
    }

    return res.status(200).json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    return next(error);
  }
};

// Create assignment (Teacher/Admin only)
export const createAssignment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      description,
      type,
      maxScore,
      passingScore,
      dueDate,
      allowLateSubmit,
      timeLimit,
      maxAttempts,
      autoGrade,
      shuffleQuestions,
      showCorrectAnswers,
      criteria,
      instructions,
      courseId,
      lessonId,
      questions
    } = req.body;

    // Validate
    if (!title || !description || !type || !courseId) {
      throw new AppError('Title, description, type, and courseId are required', 400);
    }

    // Check if user is teacher of this course or admin
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    if (req.user?.role !== 'ADMIN' && course.teacherId !== req.user?.id) {
      throw new AppError('Not authorized to create assignments for this course', 403);
    }

    // Create assignment
    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        type: type as AssignmentType,
        maxScore: maxScore || 100,
        passingScore,
        dueDate: dueDate ? new Date(dueDate) : null,
        allowLateSubmit: allowLateSubmit || false,
        timeLimit,
        maxAttempts,
        autoGrade: type === 'TEST' || type === 'QUIZ' ? true : (autoGrade || false),
        shuffleQuestions: shuffleQuestions || false,
        showCorrectAnswers: showCorrectAnswers !== false,
        criteria: criteria ? JSON.stringify(criteria) : null,
        instructions,
        courseId,
        lessonId,
        questions: {
          create: (questions as QuestionData[] || []).map((q) => ({
            text: q.text,
            type: q.type,
            points: q.points || 1,
            order: q.order || 0,
            explanation: q.explanation,
            options: {
              create: (q.options || []).map((opt) => ({
                text: opt.text,
                isCorrect: opt.isCorrect,
                order: opt.order || 0,
              })),
            },
          })),
        },
      },
      include: {
        questions: {
          include: {
            options: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

// Get assignment by ID with questions
export const getAssignmentById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const isStudent = req.user?.role === 'STUDENT';

    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            options: {
              select: {
                id: true,
                text: true,
                order: true,
                // Hide correct answers for students before submission (unless showCorrectAnswers is true)
                isCorrect: !isStudent,
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            teacherId: true,
          },
        },
      },
    });

    if (!assignment) {
      throw new AppError('Assignment not found', 404);
    }

    // Check access
    const isTeacher = assignment.course.teacherId === req.user?.id;
    const isAdmin = req.user?.role === 'ADMIN';
    const isEnrolled = await prisma.enrollment.findFirst({
      where: {
        userId: req.user!.id,
        courseId: assignment.courseId,
      },
    });

    if (!isTeacher && !isAdmin && !isEnrolled) {
      throw new AppError('Not authorized to view this assignment', 403);
    }

    // For students, check if they already submitted
    let mySubmission = null;
    if (isStudent) {
      mySubmission = await prisma.submission.findFirst({
        where: {
          assignmentId: id,
          userId: req.user!.id,
        },
        include: {
          answers: {
            include: {
              question: {
                select: {
                  id: true,
                  text: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...assignment,
        criteria: assignment.criteria ? JSON.parse(assignment.criteria) : null,
        mySubmission,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update assignment (Teacher/Admin only)
export const updateAssignment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Get assignment with course info
    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            teacherId: true,
          },
        },
      },
    });

    if (!assignment) {
      throw new AppError('Assignment not found', 404);
    }

    // Check authorization
    if (req.user?.role !== 'ADMIN' && assignment.course.teacherId !== req.user?.id) {
      throw new AppError('Not authorized to update this assignment', 403);
    }

    // Update assignment
    const updated = await prisma.assignment.update({
      where: { id },
      data: {
        ...updateData,
        criteria: updateData.criteria ? JSON.stringify(updateData.criteria) : undefined,
        dueDate: updateData.dueDate ? new Date(updateData.dueDate) : undefined,
      },
      include: {
        questions: {
          include: {
            options: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Assignment updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// Delete assignment (Teacher/Admin only)
export const deleteAssignment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Get assignment with course info
    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            teacherId: true,
          },
        },
      },
    });

    if (!assignment) {
      throw new AppError('Assignment not found', 404);
    }

    // Check authorization
    if (req.user?.role !== 'ADMIN' && assignment.course.teacherId !== req.user?.id) {
      throw new AppError('Not authorized to delete this assignment', 403);
    }

    // Delete assignment (cascade will delete questions, options, submissions, answers)
    await prisma.assignment.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};


