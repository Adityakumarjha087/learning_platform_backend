import { Request, Response } from 'express';
import { Course } from '../models/Course';
import { IChapter } from '../models/Chapter';
import { Types } from 'mongoose';

export const addChapter = async (req: Request, res: Response) => {
  try {
    const { courseId, sectionId, unitId } = req.params;
    const { title, content } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const section = course.sections.find(s => s._id.toString() === sectionId);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    const unit = section.units.find(u => u._id.toString() === unitId);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    unit.chapters.push({
      _id: new Types.ObjectId(),
      title,
      content,
      questions: [],
    });

    await course.save();

    const newChapter = unit.chapters[unit.chapters.length - 1];
    res.status(201).json(newChapter);
  } catch (error) {
    res.status(500).json({ message: 'Error adding chapter', error });
  }
};

export const updateChapter = async (req: Request, res: Response) => {
  try {
    const { courseId, sectionId, unitId, chapterId } = req.params;
    const { title, content } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const section = course.sections.find(s => s._id.toString() === sectionId);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    const unit = section.units.find(u => u._id.toString() === unitId);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    const chapter = unit.chapters.find((c: IChapter) => c._id.toString() === chapterId);
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    if (title) chapter.title = title;
    if (content) chapter.content = content;

    await course.save();
    res.json(chapter);
  } catch (error) {
    res.status(500).json({ message: 'Error updating chapter', error });
  }
};

export const deleteChapter = async (req: Request, res: Response) => {
  try {
    const { courseId, sectionId, unitId, chapterId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const section = course.sections.find(s => s._id.toString() === sectionId);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    const unit = section.units.find(u => u._id.toString() === unitId);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    const chapterIndex = unit.chapters.findIndex((c: IChapter) => c._id.toString() === chapterId);
    if (chapterIndex === -1) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    unit.chapters.splice(chapterIndex, 1);
    await course.save();

    res.json({ message: 'Chapter deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting chapter', error });
  }
};

export const getChapter = async (req: Request, res: Response) => {
  try {
    const { courseId, sectionId, unitId, chapterId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const section = course.sections.find(s => s._id.toString() === sectionId);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    const unit = section.units.find(u => u._id.toString() === unitId);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    const chapter = unit.chapters.find((c: IChapter) => c._id.toString() === chapterId);
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    res.json(chapter);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chapter', error });
  }
};