import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { Course, ICourse } from '../models/Course';
import { Chapter, IChapter } from '../models/Chapter';

const router = express.Router();

// Get all chapters for a unit
router.get('/courses/:courseId/sections/:sectionId/units/:unitId/chapters', authenticateToken, async (req, res) => {
  try {
    const { courseId, sectionId, unitId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const section = course.sections.find((section: any) => section._id.toString() === sectionId);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    const unit = section.units.find((unit: any) => unit._id.toString() === unitId);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    res.json(unit.chapters || []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chapters', error });
  }
});

// Add a new chapter to a unit
router.post('/courses/:courseId/sections/:sectionId/units/:unitId/chapters', authenticateToken, async (req, res) => {
  try {
    const { courseId, sectionId, unitId } = req.params;
    const { title, content } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const section = course.sections.find((section: any) => section._id.toString() === sectionId);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    const unit = section.units.find((unit: any) => unit._id.toString() === unitId);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    const chapter = new Chapter({ title, content });
    unit.chapters.push(chapter);
    await course.save();

    res.status(201).json(chapter);
  } catch (error) {
    res.status(500).json({ message: 'Error creating chapter', error });
  }
});

// Update a chapter
router.put('/courses/:courseId/sections/:sectionId/units/:unitId/chapters/:chapterId', authenticateToken, async (req, res) => {
  try {
    const { courseId, sectionId, unitId, chapterId } = req.params;
    const { title, content } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const section = course.sections.find((section: any) => section._id.toString() === sectionId);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    const unit = section.units.find((unit: any) => unit._id.toString() === unitId);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    const chapter = unit.chapters.find((chapter: IChapter) => chapter._id.toString() === chapterId);
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    chapter.title = title;
    chapter.content = content;
    await course.save();

    res.json(chapter);
  } catch (error) {
    res.status(500).json({ message: 'Error updating chapter', error });
  }
});

// Delete a chapter
router.delete('/courses/:courseId/sections/:sectionId/units/:unitId/chapters/:chapterId', authenticateToken, async (req, res) => {
  try {
    const { courseId, sectionId, unitId, chapterId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const section = course.sections.find((section: any) => section._id.toString() === sectionId);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    const unit = section.units.find((unit: any) => unit._id.toString() === unitId);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    unit.chapters = unit.chapters.filter((chapter: IChapter) => chapter._id.toString() !== chapterId);
    await course.save();

    res.json({ message: 'Chapter deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting chapter', error });
  }
});

export default router;