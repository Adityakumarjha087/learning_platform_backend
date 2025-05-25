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
  getInstructorCourses,
} from '../controllers/courseController';
import { protect, restrictTo } from '../middlewares/auth';
import { checkDbConnection } from '../middlewares/dbCheck';

const router = express.Router();

router.use(checkDbConnection);

router.get('/enrolled', getEnrolledCourses);
router.get('/', getCourses);

router.get('/instructor', protect, getInstructorCourses);

router.post('/', restrictTo('admin'), createCourse);
router.get('/:id', getCourse);
router.put('/:id', restrictTo('admin'), updateCourse);
router.delete('/:id', restrictTo('admin'), deleteCourse);
router.delete('/:id/students/:studentId', restrictTo('admin'), removeStudent);

export default router;