"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const courseController_1 = require("../controllers/courseController");
const auth_1 = require("../middlewares/auth");
const dbCheck_1 = require("../middlewares/dbCheck");
const router = express_1.default.Router();
// Apply database connection check to all routes
router.use(dbCheck_1.checkDbConnection);
// Public routes
router.get('/enrolled', courseController_1.getEnrolledCourses);
router.get('/', courseController_1.getCourses);
// Protected routes
router.get('/instructor', auth_1.protect, courseController_1.getInstructorCourses);
// Admin routes
router.post('/', (0, auth_1.restrictTo)('admin'), courseController_1.createCourse);
router.get('/:id', courseController_1.getCourse);
router.put('/:id', (0, auth_1.restrictTo)('admin'), courseController_1.updateCourse);
router.delete('/:id', (0, auth_1.restrictTo)('admin'), courseController_1.deleteCourse);
router.delete('/:id/students/:studentId', (0, auth_1.restrictTo)('admin'), courseController_1.removeStudent);
exports.default = router;
