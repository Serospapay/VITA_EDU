import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

interface TestAnswer {
  questionId: string;
  selectedOptions?: string[]; // For multiple choice
  textAnswer?: string; // For text answers
}

// Submit test with automatic grading
export const submitTest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { assignmentId, answers, timeSpent } = req.body as {
      assignmentId: string;
      answers: TestAnswer[];
      timeSpent?: number;
    };

    if (!assignmentId) {
      throw new AppError('Assignment ID is required', 400);
    }

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      throw new AppError('Answers are required', 400);
    }

    // Get assignment with questions
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
        course: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!assignment) {
      throw new AppError('Assignment not found', 404);
    }

    // Check if it's a test/quiz
    if (assignment.type !== 'TEST' && assignment.type !== 'QUIZ') {
      throw new AppError('This endpoint is only for tests and quizzes', 400);
    }

    // Check enrollment
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: req.user!.id,
        courseId: assignment.course.id,
        status: 'ACTIVE',
      },
    });

    if (!enrollment) {
      throw new AppError('You are not enrolled in this course', 403);
    }

    // Check if max attempts exceeded
    if (assignment.maxAttempts) {
      const previousAttempts = await prisma.submission.count({
        where: {
          assignmentId,
          userId: req.user!.id,
        },
      });

      if (previousAttempts >= assignment.maxAttempts) {
        throw new AppError(`Maximum attempts (${assignment.maxAttempts}) exceeded`, 400);
      }
    }

    // Calculate score automatically
    let totalScore = 0;
    let maxPossibleScore = 0;
    const answerRecords = [];

    for (const question of assignment.questions) {
      maxPossibleScore += question.points;
      const userAnswer = answers.find(a => a.questionId === question.id);

      if (!userAnswer) {
        // No answer provided
        answerRecords.push({
          questionId: question.id,
          selectedOptions: [],
          isCorrect: false,
          points: 0,
        });
        continue;
      }

      let isCorrect = false;
      let pointsEarned = 0;

      // Check based on question type
      if (question.type === 'SINGLE_CHOICE' || question.type === 'TRUE_FALSE') {
        const correctOption = question.options.find(opt => opt.isCorrect);
        const selectedOption = userAnswer.selectedOptions?.[0];
        isCorrect = selectedOption === correctOption?.id;
        pointsEarned = isCorrect ? question.points : 0;

        answerRecords.push({
          questionId: question.id,
          selectedOptions: selectedOption ? [selectedOption] : [],
          isCorrect,
          points: pointsEarned,
        });
      } else if (question.type === 'MULTIPLE_CHOICE') {
        const correctOptionIds = question.options
          .filter(opt => opt.isCorrect)
          .map(opt => opt.id)
          .sort();
        const selectedOptionIds = (userAnswer.selectedOptions || []).sort();

        isCorrect = JSON.stringify(correctOptionIds) === JSON.stringify(selectedOptionIds);
        pointsEarned = isCorrect ? question.points : 0;

        answerRecords.push({
          questionId: question.id,
          selectedOptions: userAnswer.selectedOptions || [],
          isCorrect,
          points: pointsEarned,
        });
      } else {
        // Short answer or long answer - requires manual grading
        answerRecords.push({
          questionId: question.id,
          selectedOptions: [],
          textAnswer: userAnswer.textAnswer,
          isCorrect: false,
          points: 0, // Will be graded manually
        });
      }

      totalScore += pointsEarned;
    }

    // Check if there are text answers that need manual grading
    const hasTextAnswers = assignment.questions.some(
      q => q.type === 'SHORT_ANSWER' || q.type === 'LONG_ANSWER'
    );

    // Get attempt number
    const attemptNumber = (await prisma.submission.count({
      where: {
        assignmentId,
        userId: req.user!.id,
      },
    })) + 1;

    // Create submission with answers
    const submission = await prisma.submission.create({
      data: {
        assignmentId,
        userId: req.user!.id,
        status: hasTextAnswers ? 'PENDING' : 'GRADED',
        score: hasTextAnswers ? null : totalScore,
        maxScore: assignment.maxScore,
        attemptNumber,
        timeSpent,
        submittedAt: new Date(),
        gradedAt: hasTextAnswers ? null : new Date(),
        answers: {
          create: answerRecords,
        },
      },
      include: {
        answers: {
          include: {
            question: {
              select: {
                id: true,
                text: true,
                type: true,
                explanation: true,
              },
            },
          },
        },
        assignment: {
          select: {
            id: true,
            title: true,
            maxScore: true,
            passingScore: true,
            showCorrectAnswers: true,
          },
        },
      },
    });

    // Calculate percentage
    const percentage = (totalScore / maxPossibleScore) * 100;
    const passed = assignment.passingScore ? percentage >= assignment.passingScore : true;

    res.status(201).json({
      success: true,
      message: hasTextAnswers 
        ? 'Test submitted successfully. Some answers require manual grading.' 
        : 'Test submitted and graded automatically!',
      data: {
        submission,
        score: totalScore,
        maxScore: maxPossibleScore,
        percentage: percentage.toFixed(2),
        passed,
        attemptNumber,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create a submission (Student only - for non-test assignments)
export const createSubmission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { assignmentId, content, githubUrl } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!assignmentId) {
      throw new AppError('Assignment ID is required', 400);
    }

    // At least one of content, files, or githubUrl must be provided
    if ((!content || content.trim() === '') && (!files || files.length === 0) && !githubUrl) {
      throw new AppError('Please provide content, files, or GitHub URL', 400);
    }

    // Check if assignment exists and get course details
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        course: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!assignment) {
      throw new AppError('Assignment not found', 404);
    }

    // Check if student is enrolled in the course
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: req.user!.id,
        courseId: assignment.course.id,
        status: 'ACTIVE',
      },
    });

    if (!enrollment) {
      throw new AppError('You are not enrolled in this course', 403);
    }

    // Check if student already submitted this assignment
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        assignmentId,
        userId: req.user!.id,
      },
    });

    if (existingSubmission) {
      // Update existing submission if it's not graded yet
      if (existingSubmission.status === 'GRADED') {
        throw new AppError('This assignment has already been graded. You cannot resubmit.', 400);
      }

      // Generate file URLs
      const fileUrls = files?.map(file => `/uploads/submissions/${file.filename}`) || [];

      const updatedSubmission = await prisma.submission.update({
        where: { id: existingSubmission.id },
        data: {
          content,
          files: fileUrls,
          githubUrl,
          status: 'PENDING',
          submittedAt: new Date(),
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
      });

      return res.status(200).json({
        success: true,
        message: 'Submission updated successfully',
        data: updatedSubmission,
      });
    }

    // Generate file URLs
    const fileUrls = files?.map(file => `/uploads/submissions/${file.filename}`) || [];

    // Create new submission
    const submission = await prisma.submission.create({
      data: {
        assignmentId,
        userId: req.user!.id,
        content,
        files: fileUrls,
        githubUrl,
        status: 'PENDING',
        submittedAt: new Date(),
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
    });

    return res.status(201).json({
      success: true,
      message: 'Submission created successfully',
      data: submission,
    });
  } catch (error) {
    return next(error);
  }
};

// Get student's submissions for a course
export const getMySubmissions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courseId } = req.params;

    // Check if student is enrolled
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: req.user!.id,
        courseId,
      },
    });

    if (!enrollment) {
      throw new AppError('You are not enrolled in this course', 403);
    }

    // Get all submissions for this course
    const submissions = await prisma.submission.findMany({
      where: {
        userId: req.user!.id,
        assignment: {
          courseId,
        },
      },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            description: true,
            maxScore: true,
            dueDate: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    next(error);
  }
};

// Get all my submissions across all courses (Student)
export const getAllMySubmissions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const submissions = await prisma.submission.findMany({
      where: {
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
        assignment: {
          select: {
            id: true,
            title: true,
            type: true,
            maxScore: true,
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    next(error);
  }
};

// Grade a submission (Teacher only)
export const gradeSubmission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { score, feedback } = req.body;

    // Validate input
    if (score === undefined || score === null) {
      throw new AppError('Score is required', 400);
    }

    // Get submission with assignment details
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        assignment: {
          include: {
            course: {
              select: {
                teacherId: true,
              },
            },
          },
        },
      },
    });

    if (!submission) {
      throw new AppError('Submission not found', 404);
    }

    // Check if the current user is the teacher of the course
    if (req.user?.role !== 'ADMIN' && submission.assignment.course.teacherId !== req.user?.id) {
      throw new AppError('Not authorized to grade this submission', 403);
    }

    // Validate score
    if (score < 0 || score > submission.assignment.maxScore) {
      throw new AppError(`Score must be between 0 and ${submission.assignment.maxScore}`, 400);
    }

    // Update submission
    const updatedSubmission = await prisma.submission.update({
      where: { id },
      data: {
        score,
        feedback: feedback || null,
        status: 'GRADED',
        gradedAt: new Date(),
      },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            maxScore: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Submission graded successfully',
      data: updatedSubmission,
    });
  } catch (error) {
    next(error);
  }
};

// Get submission by ID (with details)
export const getSubmissionById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            description: true,
            maxScore: true,
            courseId: true,
            course: {
              select: {
                id: true,
                title: true,
                teacherId: true,
              },
            },
          },
        },
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
    });

    if (!submission) {
      throw new AppError('Submission not found', 404);
    }

    // Check authorization
    const isTeacher = submission.assignment.course.teacherId === req.user?.id;
    const isStudent = submission.userId === req.user?.id;
    const isAdmin = req.user?.role === 'ADMIN';

    if (!isTeacher && !isStudent && !isAdmin) {
      throw new AppError('Not authorized to view this submission', 403);
    }

    res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    next(error);
  }
};

// Get pending submissions for teacher (all courses)
export const getTeacherPendingSubmissions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    // Get all courses where user is teacher
    const teacherCourses = await prisma.course.findMany({
      where: {
        teacherId: req.user.id,
      },
      select: {
        id: true,
      },
    });

    const courseIds = teacherCourses.map(c => c.id);

    // Get all pending submissions for these courses
    const submissions = await prisma.submission.findMany({
      where: {
        status: 'PENDING',
        assignment: {
          courseId: {
            in: courseIds,
          },
        },
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
        assignment: {
          select: {
            id: true,
            title: true,
            maxScore: true,
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
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
      orderBy: {
        submittedAt: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    next(error);
  }
};

