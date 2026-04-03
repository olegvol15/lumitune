import mongoose from 'mongoose';
import type {
  IAudiobook,
  IAudiobookChapter,
  ISavedAudiobook,
  IAudiobookProgress,
} from '../types/audiobook/audiobook.types';

const audiobookSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Audiobook title is required'], trim: true },
  authorName: { type: String, required: [true, 'Author is required'], trim: true },
  description: { type: String, required: [true, 'Description is required'], trim: true },
  coverImage: { type: String, default: 'default-podcast-cover.jpg' },
  genre: { type: String, trim: true },
  publishedAt: { type: Date, default: Date.now },
  totalDuration: { type: Number, default: 0 },
  chapterCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

audiobookSchema.index({ title: 'text', authorName: 'text', genre: 'text' });

const audiobookChapterSchema = new mongoose.Schema({
  audiobook: { type: mongoose.Schema.Types.ObjectId, ref: 'Audiobook', required: true },
  title: { type: String, required: [true, 'Chapter title is required'], trim: true },
  description: { type: String, trim: true },
  filePath: { type: String, required: true },
  coverImage: { type: String, default: 'default-podcast-cover.jpg' },
  duration: { type: Number, required: true },
  chapterNumber: { type: Number, default: 1 },
  plays: { type: Number, default: 0 },
  publishedAt: { type: Date, default: Date.now },
});

audiobookChapterSchema.index({ title: 'text' });
audiobookChapterSchema.index({ audiobook: 1, chapterNumber: 1 });

const savedAudiobookSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  audiobookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Audiobook', required: true },
  savedAt: { type: Date, default: Date.now },
});

savedAudiobookSchema.index({ userId: 1, savedAt: -1 });
savedAudiobookSchema.index({ userId: 1, audiobookId: 1 }, { unique: true });

const audiobookProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  audiobookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Audiobook', required: true },
  currentChapterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AudiobookChapter',
    required: true,
  },
  progressSeconds: { type: Number, default: 0 },
  progressPct: { type: Number, default: 0 },
  lastPlayedAt: { type: Date, default: Date.now },
});

audiobookProgressSchema.index({ userId: 1, audiobookId: 1 }, { unique: true });
audiobookProgressSchema.index({ userId: 1, lastPlayedAt: -1 });

export const Audiobook = mongoose.model<IAudiobook>('Audiobook', audiobookSchema);
export const AudiobookChapter = mongoose.model<IAudiobookChapter>(
  'AudiobookChapter',
  audiobookChapterSchema
);
export const SavedAudiobook = mongoose.model<ISavedAudiobook>(
  'SavedAudiobook',
  savedAudiobookSchema
);
export const AudiobookProgress = mongoose.model<IAudiobookProgress>(
  'AudiobookProgress',
  audiobookProgressSchema
);
