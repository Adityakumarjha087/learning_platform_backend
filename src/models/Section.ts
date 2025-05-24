import mongoose, { Document, Schema } from 'mongoose';
import { IUnit } from './Unit';

export interface ISection extends Document {
  title: string;
  description: string;
  units: IUnit[];
  createdAt: Date;
  updatedAt: Date;
}

const SectionSchema = new Schema<ISection>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  units: [{
    type: Schema.Types.ObjectId,
    ref: 'Unit',
    required: true
  }]
}, {
  timestamps: true
});

export const Section = mongoose.model<ISection>('Section', SectionSchema); 