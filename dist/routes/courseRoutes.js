"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const courseController_1 = require("../controllers/courseController");
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
// Public routes
router.get('/', courseController_1.getCourses);
router.get('/:id', courseController_1.getCourse);
// Protected routes
router.use(auth_1.protect);
// Learner routes
router.post('/:id/enroll', (0, auth_1.restrictTo)('learner'), courseController_1.enrollInCourse);
// Admin routes
router.post('/', (0, auth_1.restrictTo)('admin'), courseController_1.createCourse);
router.put('/:id', (0, auth_1.restrictTo)('admin'), courseController_1.updateCourse);
router.delete('/:id', (0, auth_1.restrictTo)('admin'), courseController_1.deleteCourse);
router.delete('/:id/students/:studentId', (0, auth_1.restrictTo)('admin'), courseController_1.removeStudent);
exports.default = router;
