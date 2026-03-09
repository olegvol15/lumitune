import mongoose from 'mongoose';

export interface IRecentlyPlayed extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  songId: mongoose.Types.ObjectId;
  playedAt: Date;
}

const recentlyPlayedSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  songId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song',
    required: true,
  },
  playedAt: {
    type: Date,
    default: Date.now,
  },
});

recentlyPlayedSchema.index({ userId: 1, playedAt: -1 });
// Unique per user+song so we just upsert/update playedAt
recentlyPlayedSchema.index({ userId: 1, songId: 1 }, { unique: true });

export const RecentlyPlayed = mongoose.model<IRecentlyPlayed>('RecentlyPlayed', recentlyPlayedSchema);