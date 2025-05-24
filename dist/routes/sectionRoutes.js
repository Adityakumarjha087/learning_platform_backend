"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const Course_1 = require("../models/Course");
const Section_1 = require("../models/Section");
const router = express_1.default.Router();
// Get all sections for a course
router.get('/courses/:courseId/sections', auth_1.authenticateToken, async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await Course_1.Course.findById(courseId).populate('sections');
        res.json((course === null || course === void 0 ? void 0 : course.sections) || []);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching sections', error });
    }
});
// Add a new section to a course
router.post('/courses/:courseId/sections', auth_1.authenticateToken, async (req, res) => {
    try {
        const { courseId } = req.params;
        const { title, description } = req.body;
        const course = await Course_1.Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        const section = new Section_1.Section({ title, description });
        course.sections.push(section);
        await course.save();
        res.status(201).json(section);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating section', error });
    }
});
// Update a section
router.put('/courses/:courseId/sections/:sectionId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { courseId, sectionId } = req.params;
        const { title, description } = req.body;
        const course = await Course_1.Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        const section = course.sections.find(section => section._id.toString() === sectionId);
        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }
        section.title = title;
        section.description = description;
        await course.save();
        res.json(section);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating section', error });
    }
});
// Delete a section
router.delete('/courses/:courseId/sections/:sectionId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { courseId, sectionId } = req.params;
        const course = await Course_1.Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        course.sections = course.sections.filter((section) => section._id.toString() !== sectionId);
        await course.save();
        res.json({ message: 'Section deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting section', error });
    }
});
exports.default = router;
