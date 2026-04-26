import mongoose from 'mongoose';
import type { IMood } from '../types/mood/mood.types';

const moodSchema = new mongoose.Schema<IMood>(
  {
    name: {
      type: String,
      required: [true, 'Mood name is required'],
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
  },
  { timestamps: true }
);

moodSchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });
moodSchema.index({ slug: 1 }, { unique: true });

export const Mood = mongoose.model<IMood>('Mood', moodSchema);
