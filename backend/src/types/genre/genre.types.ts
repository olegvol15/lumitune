import type mongoose from 'mongoose';

export interface IGenre {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GenreUsage {
  tracks: number;
  albums: number;
  audiobooks: number;
  total: number;
}
