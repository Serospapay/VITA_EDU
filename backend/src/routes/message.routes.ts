import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getCourseMessages,
  sendCourseMessage,
  getMyCourseChats,
  markCourseMessagesAsRead,
} from '../controllers/message.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get user's courses for chat
router.get('/courses', getMyCourseChats);

// Get messages for a course
router.get('/course/:courseId', getCourseMessages);

// Send message to course
router.post('/course/:courseId', sendCourseMessage);

// Mark course messages as read
router.put('/course/:courseId/read', markCourseMessagesAsRead);

export default router;

