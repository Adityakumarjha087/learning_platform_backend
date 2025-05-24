import express from 'express';
import { getUserProgress, updateProgress } from '../controllers/progressController';
import { protect } from '../middlewares/auth';

const router = express.Router();

// Get user's progress for all courses
router.get('/', protect, getUserProgress);

// Update user's progress for a course
router.put('/:courseId', protect, updateProgress);

export default router; 