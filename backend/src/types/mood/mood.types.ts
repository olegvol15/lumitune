import type mongoose from 'mongoose';

export interface IMood {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MoodUsage {
  tracks: number;
  total: number;
}
