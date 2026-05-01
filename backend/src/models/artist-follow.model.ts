import mongoose from 'mongoose';

export interface IArtistFollow extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  artistId: string;
  artistName: string;
  image?: string;
  genre?: string;
  createdAt: Date;
}

const artistFollowSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  artistId: {
    type: String,
    required: true,
    trim: true,
  },
  artistName: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    type: String,
    trim: true,
  },
  genre: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

artistFollowSchema.index({ userId: 1, artistId: 1 }, { unique: true });
artistFollowSchema.index({ artistId: 1, createdAt: -1 });
artistFollowSchema.index({ userId: 1, createdAt: -1 });

export const ArtistFollow = mongoose.model<IArtistFollow>('ArtistFollow', artistFollowSchema);
