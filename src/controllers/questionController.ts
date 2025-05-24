import { Request, Response } from 'express';
import { Course } from '../models/Course';
import { Types } from 'mongoose';

export const addQuestion = async (req: Request, res: Response) => {
  try {
    const { courseId, sectionId, unitId, chapterId } = req.params;
    const { type, question, options, correctAnswer, points, media } = req.body;

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

    const chapter = unit.chapters.find((chapter: any) => chapter._id.toString() === chapterId);
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    chapter.questions.push({
      type,
      question,
      options,
      correctAnswer,
      points,
      media
    } as any);

    await course.save();

    const newQuestion = chapter.questions[chapter.questions.length - 1];
    res.status(201).json(newQuestion);
  } catch (error) {
    res.status(500).json({ message: 'Error adding question', error });
  }
};

export const updateQuestion = async (req: Request, res: Response) => {
  try {
    const { courseId, sectionId, unitId, chapterId, questionId } = req.params;
    const { type, question, options, correctAnswer, points, media } = req.body;

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

    const chapter = unit.chapters.find((chapter: any) => chapter._id.toString() === chapterId);
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    const questionDoc = chapter.questions.find((question: any) => question._id.toString() === questionId);
    if (!questionDoc) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (type) questionDoc.type = type;
    if (question) questionDoc.question = question;
    if (options) questionDoc.options = options;
    if (correctAnswer) questionDoc.correctAnswer = correctAnswer;
    if (points) questionDoc.points = points;
    if (media) questionDoc.media = media;

    await course.save();
    res.json(questionDoc);
  } catch (error) {
    res.status(500).json({ message: 'Error updating question', error });
  }
};

export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    const { courseId, sectionId, unitId, chapterId, questionId } = req.params;

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

    const chapter = unit.chapters.find((chapter: any) => chapter._id.toString() === chapterId);
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    const questionIndex = chapter.questions.findIndex((question: any) => question._id.toString() === questionId);
    if (questionIndex === -1) {
      return res.status(404).json({ message: 'Question not found' });
    }
    chapter.questions.splice(questionIndex, 1);
    await course.save();

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting question', error });
  }
};

export const getQuestion = async (req: Request, res: Response) => {
  try {
    const { courseId, sectionId, unitId, chapterId, questionId } = req.params;

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

    const chapter = unit.chapters.find((chapter: any) => chapter._id.toString() === chapterId);
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    const question = chapter.questions.find((question: any) => question._id.toString() === questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching question', error });
  }
};