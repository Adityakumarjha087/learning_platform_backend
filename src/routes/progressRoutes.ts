import express from 'express';
import { getUserProgress, updateProgress } from '../controllers/progressController';
import { protect } from '../middlewares/auth';

const router = express.Router();

router.get('/', protect, getUserProgress);

router.put('/:courseId', protect, updateProgress);

export default router;