import mongoose from 'mongoose';
import type { IPodcast } from '../types/podcast/podcast.types';

const podcastSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Podcast title is required'], trim: true },
  author: { type: String, required: [true, 'Author is required'], trim: true },
  description: { type: String, required: [true, 'Description is required'], trim: true },
  coverImage: { type: String, default: 'default-podcast-cover.jpg' },
  category: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
});

podcastSchema.index({ title: 'text', author: 'text' });

export const Podcast = mongoose.model<IPodcast>('Podcast', podcastSchema);
