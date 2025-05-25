import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { Course, ICourse } from '../models/Course';
import { Unit, IUnit } from '../models/Unit';

const router = express.Router();

router.get('/courses/:courseId/sections/:sectionId/units', authenticateToken, async (req, res) => {
  try {
    const { courseId, sectionId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const section = course.sections.find(section => section._id.toString() === sectionId);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    res.json(section.units || []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching units', error });
  }
});

router.post('/courses/:courseId/sections/:sectionId/units', authenticateToken, async (req, res) => {
  try {
    const { courseId, sectionId } = req.params;
    const { title, description } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const section = course.sections.find(section => section._id.toString() === sectionId);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    const unit = new Unit({ title, description });
    section.units.push(unit);
    await course.save();

    res.status(201).json(unit);
  } catch (error) {
    res.status(500).json({ message: 'Error creating unit', error });
  }
});

router.put('/courses/:courseId/sections/:sectionId/units/:unitId', authenticateToken, async (req, res) => {
  try {
    const { courseId, sectionId, unitId } = req.params;
    const { title, description } = req.body;

    const course = await Course.findById(courseId);
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
  } catch (error) {
    res.status(500).json({ message: 'Error updating unit', error });
  }
});

router.delete('/courses/:courseId/sections/:sectionId/units/:unitId', authenticateToken, async (req, res) => {
  try {
    const { courseId, sectionId, unitId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const section = course.sections.find(section => section._id.toString() === sectionId);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    section.units = section.units.filter((unit: IUnit) => unit._id.toString() !== unitId);
    await course.save();

    res.json({ message: 'Unit deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting unit', error });
  }
});

export default router;