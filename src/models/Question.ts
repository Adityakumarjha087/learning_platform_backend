import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion extends Document {
  type: 'multiple-choice' | 'fill-blank' | 'text' | 'audio';
  question: string;
  options?: string[];
  correctAnswer: string;
  points: number;
  media?: {
    type: 'image' | 'audio';
    url: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  type: {
    type: String,
    required: true,
    enum: ['multiple-choice', 'fill-blank', 'text', 'audio']
  },
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String
  }],
  correctAnswer: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    required: true,
    default: 1
  },
  media: {
    type: {
      type: String,
      enum: ['image', 'audio']
    },
    url: String
  }
}, {
  timestamps: true
});

export const Question = mongoose.model<IQuestion>('Question', QuestionSchema); 