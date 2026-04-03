import fs from 'fs';
import type {
  IAudiobook,
  IAudiobookChapter,
  IAudiobookProgress,
} from './audiobook.types';

export interface AudiobookCreateInput {
  title: string;
  authorName: string;
  description: string;
  coverImage?: string;
  genre?: string;
  publishedAt?: string;
}

export interface AudiobookUpdateInput {
  title?: string;
  authorName?: string;
  description?: string;
  coverImage?: string;
  genre?: string;
  publishedAt?: string;
  totalDuration?: number;
  chapterCount?: number;
}

export interface AudiobookChapterUploadInput {
  file?: Express.Multer.File;
  coverImage?: string;
  body: {
    title?: string;
    description?: string;
    chapterNumber?: string | number;
    publishedAt?: string;
  };
  audiobookId: string;
}

export interface AudiobookChapterUpdateInput {
  title?: string;
  description?: string;
  coverImage?: string;
  chapterNumber?: number;
  publishedAt?: string;
  audioFile?: Express.Multer.File;
  filePath?: string;
  duration?: number;
}

export interface AudiobookWithChapters {
  audiobook: IAudiobook;
  chapters: IAudiobookChapter[];
}

export interface StreamAudiobookChapterResult {
  statusCode: 200 | 206;
  headers: Record<string, string | number>;
  stream: fs.ReadStream;
}

export interface UpdateAudiobookProgressInput {
  audiobookId: string;
  chapterId: string;
  progressSeconds: number;
  progressPct: number;
}

export interface AudiobookProgressResult {
  progress: IAudiobookProgress | null;
}
