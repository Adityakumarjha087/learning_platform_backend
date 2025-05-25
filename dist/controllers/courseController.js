"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnrolledCourses = exports.removeStudent = exports.enrollInCourse = exports.deleteCourse = exports.updateCourse = exports.getInstructorCourses = exports.getCourse = exports.getCourses = exports.createCourse = void 0;
const Course_1 = require("../models/Course");
const errorHandler_1 = require("../middlewares/errorHandler");
const mongoose_1 = __importDefault(require("mongoose"));
const node_cache_1 = __importDefault(require("node-cache"));
// Initialize cache with 5 minutes TTL
const cache = new node_cache_1.default({ stdTTL: 300 });
// Helper function to handle database operations with retry
const withRetry = async (operation, maxRetries = 3) => {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        }
        catch (error) {
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
const createCourse = async (req, res) => {
    var _a;
    try {
        const { title, description, sections } = req.body;
        const course = await withRetry(() => {
            var _a;
            return Course_1.Course.create({
                title,
                description,
                instructor: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                sections: sections || [],
            });
        });
        // Invalidate cache after creating new course
        cache.del('courses');
        cache.del(`instructor_courses_${(_a = req.user) === null || _a === void 0 ? void 0 : _a.id}`);
        res.status(201).json({
            success: true,
            data: course,
        });
    }
    catch (error) {
        throw new errorHandler_1.AppError(error.message, 400);
    }
};
exports.createCourse = createCourse;
// Get all courses
const getCourses = async (req, res) => {
    try {
        // Try to get from cache first
        const cachedCourses = cache.get('courses');
        if (cachedCourses) {
            return res.json({
                success: true,
                data: cachedCourses,
            });
        }
        const courses = await withRetry(() => Course_1.Course.find()
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
    }
    catch (error) {
        throw new errorHandler_1.AppError(error.message, 400);
    }
};
exports.getCourses = getCourses;
// Get single course
const getCourse = async (req, res) => {
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
        const course = await withRetry(() => Course_1.Course.findById(courseId)
            .populate('instructor', 'name email')
            .populate('enrolledStudents', 'name email')
            .select('-sections.units.chapters.questions.correctAnswer')
            .lean());
        if (!course) {
            throw new errorHandler_1.AppError('Course not found', 404);
        }
        // Cache the result
        cache.set(`course_${courseId}`, course);
        res.json({
            success: true,
            data: course,
        });
    }
    catch (error) {
        throw new errorHandler_1.AppError(error.message, 400);
    }
};
exports.getCourse = getCourse;
// Get courses created by instructor
const getInstructorCourses = async (req, res) => {
    try {
        const user = req.user;
        const cacheKey = `instructor_courses_${user._id}`;
        // Try to get from cache first
        const cachedCourses = cache.get(cacheKey);
        if (cachedCourses) {
            return res.json({
                success: true,
                data: cachedCourses,
            });
        }
        const courses = await withRetry(() => Course_1.Course.find({ instructor: user._id })
            .populate('instructor', 'name email')
            .select('-sections.units.chapters.questions.correctAnswer')
            .lean());
        // Cache the results
        cache.set(cacheKey, courses);
        res.json({
            success: true,
            data: courses,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.getInstructorCourses = getInstructorCourses;
// Update course
const updateCourse = async (req, res) => {
    try {
        const course = await withRetry(() => Course_1.Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }));
        if (!course) {
            throw new errorHandler_1.AppError('Course not found', 404);
        }
        // Invalidate cache
        cache.del('courses');
        cache.del(`course_${req.params.id}`);
        cache.del(`instructor_courses_${course.instructor}`);
        res.json({
            success: true,
            data: course,
        });
    }
    catch (error) {
        throw new errorHandler_1.AppError(error.message, 400);
    }
};
exports.updateCourse = updateCourse;
// Delete course
const deleteCourse = async (req, res) => {
    try {
        const course = await withRetry(() => Course_1.Course.findById(req.params.id));
        if (!course) {
            throw new errorHandler_1.AppError('Course not found', 404);
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
    }
    catch (error) {
        throw new errorHandler_1.AppError(error.message, 400);
    }
};
exports.deleteCourse = deleteCourse;
// Enroll in course
const enrollInCourse = async (req, res) => {
    var _a;
    try {
        const courseId = req.params.id;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            throw new errorHandler_1.AppError('User not authenticated', 401);
        }
        // Ensure userId is a valid ObjectId
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            throw new errorHandler_1.AppError('Invalid user ID format', 400);
        }
        const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
        const course = await withRetry(() => Course_1.Course.findById(courseId));
        if (!course) {
            throw new errorHandler_1.AppError('Course not found', 404);
        }
        // Check if user is already enrolled using ObjectId comparison
        if (course.enrolledStudents.some(studentId => studentId.equals(userObjectId))) {
            throw new errorHandler_1.AppError('Already enrolled in this course', 400);
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
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            throw error; // Re-throw known AppErrors
        }
        console.error('Error in enrollInCourse:', error);
        throw new errorHandler_1.AppError(error.message || 'Error enrolling in course', 500);
    }
};
exports.enrollInCourse = enrollInCourse;
// Remove student from course
const removeStudent = async (req, res) => {
    try {
        const course = await withRetry(() => Course_1.Course.findById(req.params.id));
        if (!course) {
            throw new errorHandler_1.AppError('Course not found', 404);
        }
        course.enrolledStudents = course.enrolledStudents.filter((studentId) => studentId.toString() !== req.params.studentId);
        await withRetry(() => course.save());
        // Invalidate cache
        cache.del('courses');
        cache.del(`course_${req.params.id}`);
        cache.del(`instructor_courses_${course.instructor}`);
        res.json({
            success: true,
            data: course,
        });
    }
    catch (error) {
        throw new errorHandler_1.AppError(error.message, 400);
    }
};
exports.removeStudent = removeStudent;
// Get enrolled courses for a user
const getEnrolledCourses = async (req, res) => {
    try {
        const user = req.user;
        const cacheKey = `enrolled_courses_${user._id}`;
        // Try to get from cache first
        const cachedCourses = cache.get(cacheKey);
        if (cachedCourses) {
            return res.json({
                success: true,
                data: cachedCourses,
            });
        }
        const courses = await withRetry(() => Course_1.Course.find({ enrolledStudents: user._id })
            .populate('instructor', 'name email')
            .select('-sections.units.chapters.questions.correctAnswer')
            .lean());
        // Cache the results
        cache.set(cacheKey, courses);
        res.json({
            success: true,
            data: courses,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.getEnrolledCourses = getEnrolledCourses;
