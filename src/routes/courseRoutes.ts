import express from 'express';
import {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  removeStudent,
  getEnrolledCourses,
} from '../controllers/courseController';
import { protect, restrictTo } from '../middlewares/auth';

const router = express.Router();

// Public routes
router.get('/enrolled', getEnrolledCourses);
router.get('/', getCourses);
router.get('/:id', getCourse);

// Protected routes
router.use(protect);

// Learner routes
router.post('/:id/enroll', restrictTo('learner'), enrollInCourse);

// Admin routes
router.post('/', restrictTo('admin'), createCourse);
router.put('/:id', restrictTo('admin'), updateCourse);
router.delete('/:id', restrictTo('admin'), deleteCourse);
router.delete('/:id/students/:studentId', restrictTo('admin'), removeStudent);

export default router; 