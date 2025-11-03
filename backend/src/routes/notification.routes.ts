import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getMyNotifications,
  markAsRead,
  deleteNotification,
} from '../controllers/notification.controller';

const router = Router();

// Get my notifications
router.get('/', authenticate, getMyNotifications);

// Mark notification as read
router.put('/:id/read', authenticate, markAsRead);

// Delete notification
router.delete('/:id', authenticate, deleteNotification);

export default router;

