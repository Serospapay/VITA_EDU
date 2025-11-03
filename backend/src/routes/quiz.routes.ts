import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

// Stub routes
router.get('/', authenticate, (_req, res) => res.json({ success: true, data: [] }));

export default router;

