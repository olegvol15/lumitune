import mongoose from 'mongoose';

export interface IUserResetCode extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  codeHash: string;
  expiresAt: Date;
  createdAt: Date;
}

const userResetCodeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // one active code per user at a time
  },
  codeHash: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// TTL index — MongoDB auto-deletes expired codes
userResetCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const UserResetCode = mongoose.model<IUserResetCode>('UserResetCode', userResetCodeSchema);
