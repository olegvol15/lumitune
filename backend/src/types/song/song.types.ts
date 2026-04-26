import mongoose from 'mongoose';

export interface ISong extends mongoose.Document {
  title: string;
  artist: string;
  album?: string;
  albumId?: mongoose.Types.ObjectId;
  genre?: string;
  mood?: string;
  duration: number;
  filePath: string;
  coverImage?: string;
  uploadedBy: mongoose.Types.ObjectId;
  plays: number;
  createdAt: Date;
}
