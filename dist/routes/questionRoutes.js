"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const questionController_1 = require("../controllers/questionController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// All routes require authentication
router.use(auth_1.authenticateToken);
// Question routes
router.post('/courses/:courseId/sections/:sectionId/units/:unitId/chapters/:chapterId/questions', questionController_1.addQuestion);
router.put('/courses/:courseId/sections/:sectionId/units/:unitId/chapters/:chapterId/questions/:questionId', questionController_1.updateQuestion);
router.delete('/courses/:courseId/sections/:sectionId/units/:unitId/chapters/:chapterId/questions/:questionId', questionController_1.deleteQuestion);
router.get('/courses/:courseId/sections/:sectionId/units/:unitId/chapters/:chapterId/questions/:questionId', questionController_1.getQuestion);
exports.default = router;
