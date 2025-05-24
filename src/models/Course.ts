import mongoose, { Schema, Document } from 'mongoose';
import { ISection } from './Section';
import { IUser } from './User';
import { IChapter } from './Chapter';
import { IQuestion } from './Question';

export interface IUnit {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  chapters: IChapter[];
}

export interface ICourse extends Document {
  title: string;
  description: string;
  instructor: mongoose.Types.ObjectId;
  enrolledStudents: mongoose.Types.ObjectId[];
  sections: ISection[];
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  type: {
    type: String,
    enum: ['multiple-choice', 'fill-blank', 'text', 'audio'],
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  options: [String],
  correctAnswer: {
    type: String,
    required: true,
  },
  points: {
    type: Number,
    required: true,
    default: 1,
  },
  media: {
    type: {
      type: String,
      enum: ['image', 'audio'],
    },
    url: String,
  },
});

const ChapterSchema = new Schema<IChapter>({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  questions: [QuestionSchema],
});

const UnitSchema = new Schema<IUnit>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  chapters: [ChapterSchema],
});

const SectionSchema = new Schema<ISection>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  units: [UnitSchema],
});

const CourseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a course title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a course description'],
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    enrolledStudents: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    sections: [SectionSchema],
  },
  {
    timestamps: true,
  }
);

export const Course = mongoose.model<ICourse>('Course', CourseSchema);