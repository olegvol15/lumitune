import mongoose from 'mongoose';

export interface IAlbum extends mongoose.Document {
  title: string;
  artistName: string;
  artistUserId?: mongoose.Types.ObjectId;
  description?: string;
  coverImage?: string;
  genre?: string;
  releaseDate?: Date;
  publishedAt: Date;
  trackIds: mongoose.Types.ObjectId[];
  trackCount: number;
  totalDuration: number;
  createdAt: Date;
}

export interface ISavedAlbum extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  albumId: mongoose.Types.ObjectId;
  savedAt: Date;
}
