import { Request, Response } from 'express';
import { Progress } from '../models/Progress';
import { Course } from '../models/Course';
import { Chapter, IChapter } from '../models/Chapter';
import { AppError } from '../middlewares/errorHandler';
import mongoose from 'mongoose';

// Get user's progress for all courses
export const getUserProgress = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    const userId = req.user.id;

    const progress = await Progress.find({ user: userId })
      .populate('course', 'title description')
      .lean();

    // Convert to record format for frontend
    const progressRecord = progress.reduce((acc, curr) => {
      acc[curr.course._id.toString()] = {
        currentSection: curr.currentSection,
        currentUnit: curr.currentUnit,
        currentChapter: curr.currentChapter,
        completedChapters: curr.completedChapters,
        quizScores: curr.quizScores,
      };
      return acc;
    }, {} as Record<string, any>);

    res.json({
      success: true,
      data: progressRecord,
    });
  } catch (error: any) {
    throw new AppError(error.message, 400);
  }
};

// Update user's progress for a course
export const updateProgress = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    const userId = req.user.id;
    const { courseId } = req.params;
    const { currentSection, currentUnit, currentChapter, completedChapters, quizScores } = req.body;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      throw new AppError('Invalid course ID', 400);
    }

    const progress = await Progress.findOneAndUpdate(
      { user: userId, course: courseId },
      {
        currentSection,
        currentUnit,
        currentChapter,
        completedChapters,
        quizScores,
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      data: progress,
    });
  } catch (error: any) {
    throw new AppError(error.message, 400);
  }
};

// Get user progress for a course
export const getProgress = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    const { courseId } = req.params;
    const userId = req.user.id;

    const progress = await Progress.findOne({ user: userId, course: courseId })
      .populate('completedChapters')
      .populate('quizScores.chapterId');

    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    res.json(progress);
  } catch (error) {
    console.error('Error getting progress:', error);
    res.status(500).json({ message: 'Error getting progress' });
  }
};

export const resetProgress = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    const { courseId } = req.params;
    const userId = req.user.id;

    const progress = await Progress.findOne({ user: userId, course: courseId });
    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    // Reset progress
    progress.completedChapters = [];
    progress.quizScores = [];
    progress.lastAccessedAt = new Date();

    await progress.save();
    res.json(progress);
  } catch (error) {
    console.error('Error resetting progress:', error);
    res.status(500).json({ message: 'Error resetting progress' });
  }
};

// Submit quiz answers
export const submitQuiz = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }
    const userId = req.user.id;

    const { chapterId, answers } = req.body;

    const progress = await Progress.findOne({
      user: userId,
      course: req.params.courseId,
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress not found',
      });
    }

    // Get course to check answers
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Find the chapter and its questions
    let chapter: IChapter | undefined;
    let totalPoints = 0;
    let score = 0;

    for (const section of course.sections || []) {
      for (const unit of section.units) {
        const foundChapter = unit.chapters.find(
          (c: IChapter) => c._id.toString() === chapterId
        );
        if (foundChapter) {
          chapter = foundChapter;
          break;
        }
      }
      if (chapter) break;
    }

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found',
      });
    }

    // Calculate score
    for (const question of chapter.questions) {
      totalPoints += question.points;
      const answer = answers[question._id.toString()];
      if (answer === question.correctAnswer) {
        score += question.points;
      }
    }

    // Update progress
    if (!progress.completedChapters.includes(chapterId)) {
      progress.completedChapters.push(chapterId);
    }

    // Update quiz scores
    const existingQuiz = progress.quizScores.find(
      (q) => q.chapterId.toString() === chapterId
    );

    if (existingQuiz) {
      existingQuiz.score = score;
      existingQuiz.totalPoints = totalPoints;
      existingQuiz.lastAttempt = new Date();
    } else {
      progress.quizScores.push({
        chapterId,
        score,
        totalPoints,
        submittedAt: new Date(),
        lastAttempt: new Date(),
      });
    }

    await progress.save();

    res.status(200).json({
      success: true,
      data: {
        score,
        totalPoints,
        percentage: (score / totalPoints) * 100,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all completed chapters for a user
export const getCompletedChapters = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }
    const userId = req.user.id;

    const progress = await Progress.find({
      user: userId,
    }).populate({
      path: 'course',
      select: 'title description',
    });

    res.json({
      success: true,
      data: progress,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};