import { Router } from 'express';
import { authenticate, isTeacherOrAdmin } from '../middleware/auth';
import {
  getLessonById,
  getLessonsByCourse,
  createLesson,
  updateLesson,
  deleteLesson,
} from '../controllers/lesson.controller';

const router = Router();

// Get lesson by ID
router.get('/:id', authenticate, getLessonById);

// Get lessons by course ID
router.get('/course/:courseId', authenticate, getLessonsByCourse);

// Create lesson for a course
router.post('/course/:courseId', authenticate, isTeacherOrAdmin, createLesson);

// Update lesson
router.put('/:id', authenticate, isTeacherOrAdmin, updateLesson);

// Delete lesson
router.delete('/:id', authenticate, isTeacherOrAdmin, deleteLesson);

export default router;

