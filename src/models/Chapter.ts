import mongoose, { Document, Schema } from 'mongoose';
import { IQuestion } from './Question';

export interface IChapter {
  _id: mongoose.Types.ObjectId;
  title: string;
  content: string;
  questions: IQuestion[];
}

const ChapterSchema = new Schema<IChapter>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  questions: [{
    type: Schema.Types.ObjectId,
    ref: 'Question'
  }]
}, {
  timestamps: true
});

export const Chapter = mongoose.model<IChapter>('Chapter', ChapterSchema); 