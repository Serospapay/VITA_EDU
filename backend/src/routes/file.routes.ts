import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';
import {
  uploadFiles,
  getFileById,
  deleteFile,
  getFilesByLesson,
  getFilesByCourse,
} from '../controllers/file.controller';

const router = Router();

// Upload files (multiple)
router.post('/upload', authenticate, upload.array('files', 10), uploadFiles);

// Get file by ID
router.get('/:id', authenticate, getFileById);

// Delete file
router.delete('/:id', authenticate, deleteFile);

// Get files by lesson
router.get('/lesson/:lessonId', authenticate, getFilesByLesson);

// Get files by course
router.get('/course/:courseId', authenticate, getFilesByCourse);

export default router;
