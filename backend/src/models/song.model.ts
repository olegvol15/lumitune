import mongoose from 'mongoose';
import { ISong } from '../types/song/song.types';

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Song title is required'],
    trim: true,
  },
  artist: {
    type: String,
    required: [true, 'Artist name is required'],
    trim: true,
  },
  album: {
    type: String,
    trim: true,
  },
  albumId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album',
    required: false,
  },
  genre: {
    type: String,
    trim: true,
  },
  mood: {
    type: String,
    trim: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  coverImage: {
    type: String,
    default: 'default-album-cover.jpg',
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  plays: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create indexes for better query performance
songSchema.index({ title: 'text', artist: 'text', album: 'text' });
songSchema.index({ genre: 1 });
songSchema.index({ mood: 1 });
songSchema.index({ plays: -1 });
songSchema.index({ albumId: 1 });

export const Song = mongoose.model<ISong>('Song', songSchema);
