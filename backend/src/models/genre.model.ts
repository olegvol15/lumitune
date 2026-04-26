import mongoose from 'mongoose';
import type { IGenre } from '../types/genre/genre.types';

const genreSchema = new mongoose.Schema<IGenre>(
  {
    name: {
      type: String,
      required: [true, 'Genre name is required'],
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

genreSchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });
genreSchema.index({ slug: 1 }, { unique: true });

export const Genre = mongoose.model<IGenre>('Genre', genreSchema);
