import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth';
import {
  getMyEnrollments,
  enrollInCourse,
  unenrollFromCourse,
  adminEnrollStudent,
  adminUnenrollStudent,
  getCourseEnrollments,
} from '../controllers/enrollment.controller';

const router = Router();

// Student routes
router.get('/my', authenticate, getMyEnrollments);
router.post('/', authenticate, enrollInCourse);
router.delete('/:id', authenticate, unenrollFromCourse);

// Teacher/Admin routes - get students for a course
router.get('/course/:courseId', authenticate, getCourseEnrollments);

// Admin routes
router.post('/admin', authenticate, isAdmin, adminEnrollStudent);
router.delete('/admin/:id', authenticate, isAdmin, adminUnenrollStudent);

export default router;

