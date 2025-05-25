import { Request, Response } from 'express';
import { Course } from '../models/Course';
import { IUser } from '../models/User';
import { AppError } from '../middlewares/errorHandler';
import mongoose, { Types } from 'mongoose';
import NodeCache from 'node-cache';

// Initialize cache with 5 minutes TTL
const cache = new NodeCache({ stdTTL: 300 });

// Helper function to handle database operations with retry
const withRetry = async <T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      if (error.name === 'MongoNetworkTimeoutError' || error.name === 'MongoServerSelectionError') {
        // Wait for 1 second before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
};

// Create a new course
export const createCourse = async (req: Request, res: Response) => {
  try {
    const { title, description, sections } = req.body;
    const course = await withRetry(() => Course.create({
      title,
      description,
      instructor: req.user?.id,
      sections: sections || [],
    }));

    // Invalidate cache after creating new course
    cache.del('courses');
    cache.del(`instructor_courses_${req.user?.id}`);

    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (error: any) {
    throw new AppError(error.message, 400);
  }
};

// Get all courses
export const getCourses = async (req: Request, res: Response) => {
  try {
    // Try to get from cache first
    const cachedCourses = cache.get('courses');
    if (cachedCourses) {
      return res.json({
        success: true,
        data: cachedCourses,
      });
    }

    const courses = await withRetry(() => Course.find()
      .populate('instructor', 'name email')
      .populate('enrolledStudents', 'name email')
      .select('-sections.units.chapters.questions.correctAnswer')
      .lean());

    // Cache the results
    cache.set('courses', courses);

    res.json({
      success: true,
      data: courses,
    });
  } catch (error: any) {
    throw new AppError(error.message, 400);
  }
};

// Get single course
export const getCourse = async (req: Request, res: Response) => {
  try {
    const courseId = req.params.id;
    
    // Try to get from cache first
    const cachedCourse = cache.get(`course_${courseId}`);
    if (cachedCourse) {
      return res.json({
        success: true,
        data: cachedCourse,
      });
    }

    const course = await withRetry(() => Course.findById(courseId)
      .populate('instructor', 'name email')
      .populate('enrolledStudents', 'name email')
      .select('-sections.units.chapters.questions.correctAnswer')
      .lean());

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Cache the result
    cache.set(`course_${courseId}`, course);

    res.json({
      success: true,
      data: course,
    });
  } catch (error: any) {
    throw new AppError(error.message, 400);
  }
};

// Get courses created by instructor
export const getInstructorCourses = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const cacheKey = `instructor_courses_${user._id}`;

    // Try to get from cache first
    const cachedCourses = cache.get(cacheKey);
    if (cachedCourses) {
      return res.json({
        success: true,
        data: cachedCourses,
      });
    }

    const courses = await withRetry(() => Course.find({ instructor: user._id })
      .populate('instructor', 'name email')
      .select('-sections.units.chapters.questions.correctAnswer')
      .lean());

    // Cache the results
    cache.set(cacheKey, courses);

    res.json({
      success: true,
      data: courses,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update course
export const updateCourse = async (req: Request, res: Response) => {
  try {
    const course = await withRetry(() => Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ));

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Invalidate cache
    cache.del('courses');
    cache.del(`course_${req.params.id}`);
    cache.del(`instructor_courses_${course.instructor}`);

    res.json({
      success: true,
      data: course,
    });
  } catch (error: any) {
    throw new AppError(error.message, 400);
  }
};

// Delete course
export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const course = await withRetry(() => Course.findById(req.params.id));
    
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    await withRetry(() => course.deleteOne());

    // Invalidate cache
    cache.del('courses');
    cache.del(`course_${req.params.id}`);
    cache.del(`instructor_courses_${course.instructor}`);

    res.json({
      success: true,
      data: {},
    });
  } catch (error: any) {
    throw new AppError(error.message, 400);
  }
};

// Enroll in course
export const enrollInCourse = async (req: Request, res: Response) => {
  try {
    const courseId = req.params.id;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    // Ensure userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
       throw new AppError('Invalid user ID format', 400);
    }
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const course = await withRetry(() => Course.findById(courseId));
    
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Check if user is already enrolled using ObjectId comparison
    if (course.enrolledStudents.some(studentId => studentId.equals(userObjectId))) {
      throw new AppError('Already enrolled in this course', 400);
    }

    course.enrolledStudents.push(userObjectId);
    await withRetry(() => course.save());

    // Invalidate cache
    cache.del('courses');
    cache.del(`course_${courseId}`);
    if (course.instructor) { // Only invalidate instructor cache if instructor exists
      cache.del(`instructor_courses_${course.instructor}`);
    }

    res.json({
      success: true,
      data: course,
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error; // Re-throw known AppErrors
    }
    console.error('Error in enrollInCourse:', error);
    throw new AppError(error.message || 'Error enrolling in course', 500);
  }
};

// Remove student from course
export const removeStudent = async (req: Request, res: Response) => {
  try {
    const course = await withRetry(() => Course.findById(req.params.id));
    
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    course.enrolledStudents = course.enrolledStudents.filter(
      (studentId) => studentId.toString() !== req.params.studentId
    );
    await withRetry(() => course.save());

    // Invalidate cache
    cache.del('courses');
    cache.del(`course_${req.params.id}`);
    cache.del(`instructor_courses_${course.instructor}`);

    res.json({
      success: true,
      data: course,
    });
  } catch (error: any) {
    throw new AppError(error.message, 400);
  }
};

// Get enrolled courses for a user
export const getEnrolledCourses = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const cacheKey = `enrolled_courses_${user._id}`;

    // Try to get from cache first
    const cachedCourses = cache.get(cacheKey);
    if (cachedCourses) {
      return res.json({
        success: true,
        data: cachedCourses,
      });
    }

    const courses = await withRetry(() => Course.find({ enrolledStudents: user._id })
      .populate('instructor', 'name email')
      .select('-sections.units.chapters.questions.correctAnswer')
      .lean());

    // Cache the results
    cache.set(cacheKey, courses);

    res.json({
      success: true,
      data: courses,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}; 