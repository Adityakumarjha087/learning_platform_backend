"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstructorCourses = exports.getEnrolledCourses = exports.removeStudent = exports.enrollInCourse = exports.deleteCourse = exports.updateCourse = exports.getCourse = exports.getCourses = exports.createCourse = void 0;
const Course_1 = require("../models/Course");
const errorHandler_1 = require("../middlewares/errorHandler");
const mongoose_1 = __importDefault(require("mongoose"));
// Create a new course
const createCourse = async (req, res) => {
    var _a;
    try {
        const { title, description, sections } = req.body;
        const course = await Course_1.Course.create({
            title,
            description,
            instructor: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
            sections: sections || [],
        });
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
        const courses = await Course_1.Course.find()
            .populate('instructor', 'name email')
            .populate('enrolledStudents', 'name email')
            .select('-sections.units.chapters.questions.correctAnswer');
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
        const course = await Course_1.Course.findById(req.params.id)
            .populate('instructor', 'name email')
            .populate('enrolledStudents', 'name email')
            .select('-sections.units.chapters.questions.correctAnswer');
        if (!course) {
            throw new errorHandler_1.AppError('Course not found', 404);
        }
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
// Update course
const updateCourse = async (req, res) => {
    var _a;
    try {
        const course = await Course_1.Course.findById(req.params.id);
        if (!course) {
            throw new errorHandler_1.AppError('Course not found', 404);
        }
        // Make sure user is course instructor
        if (course.instructor.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new errorHandler_1.AppError('Not authorized to update this course', 401);
        }
        const { title, description, sections } = req.body;
        const updatedCourse = await Course_1.Course.findByIdAndUpdate(req.params.id, {
            title,
            description,
            sections,
        }, {
            new: true,
            runValidators: true,
        });
        res.json({
            success: true,
            data: updatedCourse,
        });
    }
    catch (error) {
        throw new errorHandler_1.AppError(error.message, 400);
    }
};
exports.updateCourse = updateCourse;
// Delete course
const deleteCourse = async (req, res) => {
    var _a;
    try {
        const course = await Course_1.Course.findById(req.params.id);
        if (!course) {
            throw new errorHandler_1.AppError('Course not found', 404);
        }
        // Make sure user is course instructor
        if (course.instructor.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new errorHandler_1.AppError('Not authorized to delete this course', 401);
        }
        await course.deleteOne();
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
    var _a, _b;
    try {
        const course = await Course_1.Course.findById(req.params.id);
        if (!course) {
            throw new errorHandler_1.AppError('Course not found', 404);
        }
        // Check if user is already enrolled
        if (course.enrolledStudents.includes((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new errorHandler_1.AppError('Already enrolled in this course', 400);
        }
        course.enrolledStudents.push((_b = req.user) === null || _b === void 0 ? void 0 : _b.id);
        await course.save();
        res.json({
            success: true,
            data: course,
        });
    }
    catch (error) {
        throw new errorHandler_1.AppError(error.message, 400);
    }
};
exports.enrollInCourse = enrollInCourse;
// Remove student from course
const removeStudent = async (req, res) => {
    var _a;
    try {
        const courseId = req.params.id;
        const studentId = req.params.studentId;
        if (!courseId) {
            throw new errorHandler_1.AppError('Course ID is required', 400);
        }
        if (!studentId) {
            throw new errorHandler_1.AppError('Student ID is required', 400);
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(courseId)) {
            throw new errorHandler_1.AppError('Invalid Course ID format', 400);
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(studentId)) {
            throw new errorHandler_1.AppError('Invalid Student ID format', 400);
        }
        const course = await Course_1.Course.findById(courseId);
        if (!course) {
            throw new errorHandler_1.AppError('Course not found', 404);
        }
        // Make sure user is course instructor
        if (course.instructor.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new errorHandler_1.AppError('Not authorized to remove students from this course', 401);
        }
        // Convert studentId to ObjectId for comparison
        const studentObjectId = new mongoose_1.default.Types.ObjectId(studentId);
        // Check if student is enrolled
        if (!course.enrolledStudents.some(id => id.equals(studentObjectId))) {
            throw new errorHandler_1.AppError('Student is not enrolled in this course', 400);
        }
        course.enrolledStudents = course.enrolledStudents.filter(id => !id.equals(studentObjectId));
        await course.save();
        res.json({
            success: true,
            data: course,
        });
    }
    catch (error) {
        console.error('Error in removeStudent:', error);
        if (error instanceof mongoose_1.default.Error.CastError) {
            throw new errorHandler_1.AppError('Invalid ID format', 400);
        }
        throw new errorHandler_1.AppError(error.message, 400);
    }
};
exports.removeStudent = removeStudent;
// Get enrolled courses for a user
const getEnrolledCourses = async (req, res) => {
    try {
        const user = req.user;
        const courses = await Course_1.Course.find({ enrolledStudents: user._id })
            .populate('instructor', 'name email')
            .select('-sections.units.chapters.questions.correctAnswer');
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
// Get courses created by instructor
const getInstructorCourses = async (req, res) => {
    try {
        const user = req.user;
        const courses = await Course_1.Course.find({ instructor: user._id })
            .populate('instructor', 'name email')
            .select('-sections.units.chapters.questions.correctAnswer');
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
