import mongoose from 'mongoose';

export interface IPlaylist extends mongoose.Document {
  name: string;
  description?: string;
  coverImage?: string;
  owner: mongoose.Types.ObjectId;
  songs: mongoose.Types.ObjectId[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}
