import express from 'express';
import { addQuestion, updateQuestion, deleteQuestion, getQuestion } from '../controllers/questionController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Question routes
router.post('/courses/:courseId/sections/:sectionId/units/:unitId/chapters/:chapterId/questions', addQuestion);
router.put('/courses/:courseId/sections/:sectionId/units/:unitId/chapters/:chapterId/questions/:questionId', updateQuestion);
router.delete('/courses/:courseId/sections/:sectionId/units/:unitId/chapters/:chapterId/questions/:questionId', deleteQuestion);
router.get('/courses/:courseId/sections/:sectionId/units/:unitId/chapters/:chapterId/questions/:questionId', getQuestion);

export default router; 