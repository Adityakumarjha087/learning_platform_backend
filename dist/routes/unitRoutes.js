"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const Course_1 = require("../models/Course");
const Unit_1 = require("../models/Unit");
const router = express_1.default.Router();
// Get all units for a section
router.get('/courses/:courseId/sections/:sectionId/units', auth_1.authenticateToken, async (req, res) => {
    try {
        const { courseId, sectionId } = req.params;
        const course = await Course_1.Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        const section = course.sections.find(section => section._id.toString() === sectionId);
        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }
        res.json(section.units || []);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching units', error });
    }
});
// Add a new unit to a section
router.post('/courses/:courseId/sections/:sectionId/units', auth_1.authenticateToken, async (req, res) => {
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
        const unit = new Unit_1.Unit({ title, description });
        section.units.push(unit);
        await course.save();
        res.status(201).json(unit);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating unit', error });
    }
});
// Update a unit
router.put('/courses/:courseId/sections/:sectionId/units/:unitId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { courseId, sectionId, unitId } = req.params;
        const { title, description } = req.body;
        const course = await Course_1.Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        const section = course.sections.find(section => section._id.toString() === sectionId);
        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }
        const unit = section.units.find(unit => unit._id.toString() === unitId);
        if (!unit) {
            return res.status(404).json({ message: 'Unit not found' });
        }
        unit.title = title;
        unit.description = description;
        await course.save();
        res.json(unit);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating unit', error });
    }
});
// Delete a unit
router.delete('/courses/:courseId/sections/:sectionId/units/:unitId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { courseId, sectionId, unitId } = req.params;
        const course = await Course_1.Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        const section = course.sections.find(section => section._id.toString() === sectionId);
        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }
        section.units = section.units.filter((unit) => unit._id.toString() !== unitId);
        await course.save();
        res.json({ message: 'Unit deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting unit', error });
    }
});
exports.default = router;
