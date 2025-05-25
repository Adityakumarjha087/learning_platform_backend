import express from 'express';
import { authenticateToken, authorize } from '../middleware/auth';
import {
  register,
  login,
  getProfile,
  updateProfile,
  getEnrolledCourses,
  getCreatedCourses
} from '../controllers/userController';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.get('/enrolled-courses', authenticateToken, getEnrolledCourses);
router.get('/created-courses', authenticateToken, getCreatedCourses);

export default router;