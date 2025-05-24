import { Request, Response } from 'express';
import { Course } from '../models/Course';
import { IUser } from '../models/User';
import { AppError } from '../middlewares/errorHandler';
import mongoose, { Types } from 'mongoose';

// Create a new course
export const createCourse = async (req: Request, res: Response) => {
  try {
    const { title, description, sections } = req.body;
    const course = await Course.create({
      title,
      description,
      instructor: req.user?.id,
      sections: sections || [],
    });

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
    const courses = await Course.find()
      .populate('instructor', 'name email')
      .populate('enrolledStudents', 'name email')
      .select('-sections.units.chapters.questions.correctAnswer');

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
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email')
      .populate('enrolledStudents', 'name email')
      .select('-sections.units.chapters.questions.correctAnswer');

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    res.json({
      success: true,
      data: course,
    });
  } catch (error: any) {
    throw new AppError(error.message, 400);
  }
};

// Update course
export const updateCourse = async (req: Request, res: Response) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Make sure user is course instructor
    if (course.instructor.toString() !== req.user?.id) {
      throw new AppError('Not authorized to update this course', 401);
    }

    const { title, description, sections } = req.body;
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        sections,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({
      success: true,
      data: updatedCourse,
    });
  } catch (error: any) {
    throw new AppError(error.message, 400);
  }
};

// Delete course
export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Make sure user is course instructor
    if (course.instructor.toString() !== req.user?.id) {
      throw new AppError('Not authorized to delete this course', 401);
    }

    await course.deleteOne();

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
    const course = await Course.findById(req.params.id);

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Check if user is already enrolled
    if (course.enrolledStudents.includes(req.user?.id)) {
      throw new AppError('Already enrolled in this course', 400);
    }

    course.enrolledStudents.push(req.user?.id);
    await course.save();

    res.json({
      success: true,
      data: course,
    });
  } catch (error: any) {
    throw new AppError(error.message, 400);
  }
};

// Remove student from course
export const removeStudent = async (req: Request, res: Response) => {
  try {
    const courseId = req.params.id;
    const studentId = req.params.studentId;

    if (!courseId) {
      throw new AppError('Course ID is required', 400);
    }

    if (!studentId) {
      throw new AppError('Student ID is required', 400);
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      throw new AppError('Invalid Course ID format', 400);
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      throw new AppError('Invalid Student ID format', 400);
    }

    const course = await Course.findById(courseId);

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Make sure user is course instructor
    if (course.instructor.toString() !== req.user?.id) {
      throw new AppError('Not authorized to remove students from this course', 401);
    }

    // Convert studentId to ObjectId for comparison
    const studentObjectId = new mongoose.Types.ObjectId(studentId);

    // Check if student is enrolled
    if (!course.enrolledStudents.some(id => id.equals(studentObjectId))) {
      throw new AppError('Student is not enrolled in this course', 400);
    }

    course.enrolledStudents = course.enrolledStudents.filter(
      id => !id.equals(studentObjectId)
    );

    await course.save();

    res.json({
      success: true,
      data: course,
    });
  } catch (error: any) {
    console.error('Error in removeStudent:', error);
    if (error instanceof mongoose.Error.CastError) {
      throw new AppError('Invalid ID format', 400);
    }
    throw new AppError(error.message, 400);
  }
};

// Get enrolled courses for a user
export const getEnrolledCourses = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const courses = await Course.find({ enrolledStudents: user._id })
      .populate('instructor', 'name email')
      .select('-sections.units.chapters.questions.correctAnswer');

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

// Get courses created by instructor
export const getInstructorCourses = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const courses = await Course.find({ instructor: user._id })
      .populate('instructor', 'name email')
      .select('-sections.units.chapters.questions.correctAnswer');

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