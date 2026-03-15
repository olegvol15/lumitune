import mongoose from 'mongoose';

export interface ILikedSong extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  songId: mongoose.Types.ObjectId;
  likedAt: Date;
}

const likedSongSchema = new mongoose.Schema({
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
  likedAt: {
    type: Date,
    default: Date.now,
  },
});

likedSongSchema.index({ userId: 1, likedAt: -1 });
likedSongSchema.index({ userId: 1, songId: 1 }, { unique: true });

export const LikedSong = mongoose.model<ILikedSong>('LikedSong', likedSongSchema);
