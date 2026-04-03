import mongoose from 'mongoose';
import type { IEpisode } from '../types/podcast/podcast.types';

const episodeSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Episode title is required'], trim: true },
  description: { type: String, trim: true },
  podcast: { type: mongoose.Schema.Types.ObjectId, ref: 'Podcast', required: true },
  filePath: { type: String, required: true },
  coverImage: { type: String, default: 'default-podcast-cover.jpg' },
  duration: { type: Number, required: true },
  episodeNumber: { type: Number, default: 1 },
  plays: { type: Number, default: 0 },
  publishedAt: { type: Date, default: Date.now },
});

episodeSchema.index({ title: 'text' });
episodeSchema.index({ podcast: 1, episodeNumber: 1 });

export const Episode = mongoose.model<IEpisode>('Episode', episodeSchema);
