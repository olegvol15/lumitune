import mongoose from 'mongoose';
import type { IArtist } from '../types/artist/artist.types';

const artistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Artist name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    image: {
      type: String,
      trim: true,
    },
    bannerImage: {
      type: String,
      trim: true,
    },
    genre: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    artistUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  { timestamps: true }
);

artistSchema.index({ name: 'text', genre: 'text', bio: 'text' });
artistSchema.index({ artistUserId: 1 });

export const Artist = mongoose.model<IArtist>('Artist', artistSchema);
