import { Router } from 'express';
import {
  getCourseAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from '../controllers/assignment.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get assignments for a course
router.get('/course/:courseId', getCourseAssignments);

// Get single assignment by ID
router.get('/:id', getAssignmentById);

// Create assignment (Teacher/Admin only)
router.post('/', createAssignment);

// Update assignment (Teacher/Admin only)
router.put('/:id', updateAssignment);

// Delete assignment (Teacher/Admin only)
router.delete('/:id', deleteAssignment);

export default router;
