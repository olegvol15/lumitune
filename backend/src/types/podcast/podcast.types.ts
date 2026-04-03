import mongoose from 'mongoose';

export interface IPodcast extends mongoose.Document {
  title: string;
  author: string;
  description: string;
  coverImage: string;
  category?: string;
  createdAt: Date;
}

export interface IEpisode extends mongoose.Document {
  title: string;
  description?: string;
  podcast: mongoose.Types.ObjectId;
  filePath: string;
  coverImage: string;
  duration: number;
  episodeNumber: number;
  plays: number;
  publishedAt: Date;
}
