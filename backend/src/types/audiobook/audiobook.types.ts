import mongoose from 'mongoose';

export interface IAudiobook extends mongoose.Document {
  title: string;
  authorName: string;
  description: string;
  coverImage: string;
  genre?: string;
  publishedAt: Date;
  totalDuration: number;
  chapterCount: number;
  createdAt: Date;
}

export interface IAudiobookChapter extends mongoose.Document {
  audiobook: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  filePath: string;
  coverImage: string;
  duration: number;
  chapterNumber: number;
  plays: number;
  publishedAt: Date;
}

export interface ISavedAudiobook extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  audiobookId: mongoose.Types.ObjectId;
  savedAt: Date;
}

export interface IAudiobookProgress extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  audiobookId: mongoose.Types.ObjectId;
  currentChapterId: mongoose.Types.ObjectId;
  progressSeconds: number;
  progressPct: number;
  lastPlayedAt: Date;
}
