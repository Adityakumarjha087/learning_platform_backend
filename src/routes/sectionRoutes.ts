import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { Course, ICourse } from '../models/Course';
import { Section, ISection } from '../models/Section';

const router = express.Router();

router.get('/courses/:courseId/sections', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId).populate('sections');
    res.json(course?.sections || []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sections', error });
  }
});

router.post('/courses/:courseId/sections', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description } = req.body;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const section = new Section({ title, description });
    course.sections.push(section);
    await course.save();

    res.status(201).json(section);
  } catch (error) {
    res.status(500).json({ message: 'Error creating section', error });
  }
});

router.put('/courses/:courseId/sections/:sectionId', authenticateToken, async (req, res) => {
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

    section.title = title;
    section.description = description;
    await course.save();

    res.json(section);
  } catch (error) {
    res.status(500).json({ message: 'Error updating section', error });
  }
});

router.delete('/courses/:courseId/sections/:sectionId', authenticateToken, async (req, res) => {
  try {
    const { courseId, sectionId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    course.sections = course.sections.filter((section: ISection) => section._id.toString() !== sectionId);
    await course.save();

    res.json({ message: 'Section deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting section', error });
  }
});

export default router;