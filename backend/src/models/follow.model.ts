import mongoose from 'mongoose';

export interface IFollow extends mongoose.Document {
  followerId: mongoose.Types.ObjectId; // the user who is following
  followingId: mongoose.Types.ObjectId; // the user being followed
  createdAt: Date;
}

const followSchema = new mongoose.Schema({
  followerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  followingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// A user can only follow another user once
followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });
// Efficient lookup of "who follows userId" and "who does userId follow"
followSchema.index({ followingId: 1, createdAt: -1 });
followSchema.index({ followerId: 1, createdAt: -1 });

export const Follow = mongoose.model<IFollow>('Follow', followSchema);