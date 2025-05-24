import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';
import { ICourse } from './Course';
import { IChapter } from './Chapter';

export interface IProgress extends Document {
  user: IUser;
  course: ICourse;
  currentSection?: string;
  currentUnit?: string;
  currentChapter?: string;
  completedChapters: IChapter[];
  quizScores: {
    chapterId: IChapter;
    score: number;
    totalPoints: number;
    submittedAt: Date;
    lastAttempt?: Date;
  }[];
  lastAccessedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProgressSchema = new Schema<IProgress>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  currentSection: { type: String },
  currentUnit: { type: String },
  currentChapter: { type: String },
  completedChapters: [{
    type: Schema.Types.ObjectId,
    ref: 'Chapter'
  }],
  quizScores: [{
    chapterId: {
      type: Schema.Types.ObjectId,
      ref: 'Chapter',
      required: true
    },
    score: {
      type: Number,
      required: true
    },
    totalPoints: {
      type: Number,
      required: true
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    lastAttempt: {
      type: Date,
      default: Date.now
    }
  }],
  lastAccessedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create compound index for user and course
ProgressSchema.index({ user: 1, course: 1 }, { unique: true });

export const Progress = mongoose.model<IProgress>('Progress', ProgressSchema);