import mongoose from 'mongoose';

export interface ISong extends mongoose.Document {
  title: string;
  artist: string;
  album?: string;
  genre?: string;
  duration: number;
  filePath: string;
  coverImage?: string;
  uploadedBy: mongoose.Types.ObjectId;
  plays: number;
  createdAt: Date;
}

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Song title is required'],
    trim: true
  },
  artist: {
    type: String,
    required: [true, 'Artist name is required'],
    trim: true
  },
  album: {
    type: String,
    trim: true
  },
  genre: {
    type: String,
    trim: true
  },
  duration: {
    type: Number,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  coverImage: {
    type: String,
    default: 'default-album-cover.jpg'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plays: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for better query performance
songSchema.index({ title: 'text', artist: 'text', album: 'text' });
songSchema.index({ genre: 1 });
songSchema.index({ plays: -1 });

export const Song = mongoose.model<ISong>('Song', songSchema);