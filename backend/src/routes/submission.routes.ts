import { Router } from 'express';
import { 
  createSubmission, 
  getMySubmissions,
  getAllMySubmissions,
  gradeSubmission, 
  getSubmissionById,
  submitTest,
  getTeacherPendingSubmissions
} from '../controllers/submission.controller';
import { authenticate, isTeacherOrAdmin } from '../middleware/auth';
import { uploadSubmissionFiles } from '../middleware/upload';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Submit test/quiz with automatic grading (Student)
router.post('/test', submitTest);

// Create submission (Student - for non-test assignments) with file uploads
router.post('/', uploadSubmissionFiles, createSubmission);

// Get all my submissions across all courses (Student)
router.get('/my', getAllMySubmissions);

// Get my submissions for a course (Student)
router.get('/course/:courseId/my', getMySubmissions);

// Get pending submissions for teacher (Teacher/Admin only)
router.get('/teacher/pending', isTeacherOrAdmin, getTeacherPendingSubmissions);

// Get submission by ID
router.get('/:id', getSubmissionById);

// Grade submission (Teacher/Admin only)
router.put('/:id/grade', gradeSubmission);

export default router;
