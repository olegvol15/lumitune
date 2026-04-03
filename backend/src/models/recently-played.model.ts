import mongoose from 'mongoose';

export interface IRecentlyPlayed extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  itemType: 'song' | 'audiobook_chapter';
  itemId: mongoose.Types.ObjectId;
  parentId?: mongoose.Types.ObjectId;
  playedAt: Date;
}

const recentlyPlayedSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  itemType: {
    type: String,
    enum: ['song', 'audiobook_chapter'],
    required: true,
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },
  playedAt: {
    type: Date,
    default: Date.now,
  },
});

recentlyPlayedSchema.index({ userId: 1, playedAt: -1 });
// Unique per user+song so we just upsert/update playedAt
recentlyPlayedSchema.index({ userId: 1, itemType: 1, itemId: 1 }, { unique: true });

export const RecentlyPlayed = mongoose.model<IRecentlyPlayed>(
  'RecentlyPlayed',
  recentlyPlayedSchema
);
