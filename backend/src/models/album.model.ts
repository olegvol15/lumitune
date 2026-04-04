import mongoose from 'mongoose';
import type { IAlbum, ISavedAlbum } from '../types/album/album.types';

const albumSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Album title is required'], trim: true },
  artistName: { type: String, required: [true, 'Artist is required'], trim: true },
  artistUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  description: { type: String, trim: true },
  coverImage: { type: String, default: 'default-album-cover.jpg' },
  genre: { type: String, trim: true },
  releaseDate: { type: Date, required: false },
  publishedAt: { type: Date, default: Date.now },
  trackIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
  trackCount: { type: Number, default: 0 },
  totalDuration: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

albumSchema.index({ title: 'text', artistName: 'text', genre: 'text' });
albumSchema.index({ artistUserId: 1, createdAt: -1 });

const savedAlbumSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  albumId: { type: mongoose.Schema.Types.ObjectId, ref: 'Album', required: true },
  savedAt: { type: Date, default: Date.now },
});

savedAlbumSchema.index({ userId: 1, savedAt: -1 });
savedAlbumSchema.index({ userId: 1, albumId: 1 }, { unique: true });

export const Album = mongoose.model<IAlbum>('Album', albumSchema);
export const SavedAlbum = mongoose.model<ISavedAlbum>('SavedAlbum', savedAlbumSchema);
