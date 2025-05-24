import mongoose, { Document, Schema } from 'mongoose';
import { IChapter } from './Chapter';

export interface IUnit extends Document {
  title: string;
  description: string;
  chapters: IChapter[];
  createdAt: Date;
  updatedAt: Date;
}

const UnitSchema = new Schema<IUnit>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  chapters: [{
    type: Schema.Types.ObjectId,
    ref: 'Chapter'
  }]
}, {
  timestamps: true
});

export const Unit = mongoose.model<IUnit>('Unit', UnitSchema); 