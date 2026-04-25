import mongoose from 'mongoose';
import { IPlaylist } from '../types/playlist.types';

const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Playlist name is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  coverImage: {
    type: String,
    default: 'default-playlist-cover.jpg',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  songs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Song',
    },
  ],
  isPublic: {
    type: Boolean,
    default: true,
  },
  kind: {
    type: String,
    enum: ['user', 'curated'],
    default: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

playlistSchema.index({ kind: 1, updatedAt: -1 });
playlistSchema.index({ owner: 1, kind: 1, updatedAt: -1 });

// Update the updatedAt timestamp on save
playlistSchema.pre('save', async function () {
  this.updatedAt = new Date();
});

export const Playlist = mongoose.model<IPlaylist>('Playlist', playlistSchema);
