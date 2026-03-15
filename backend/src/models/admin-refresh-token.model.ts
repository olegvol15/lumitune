import mongoose from 'mongoose';

export interface IAdminRefreshToken extends mongoose.Document {
  token: string;
  adminId: mongoose.Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
}

const adminRefreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
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

adminRefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
adminRefreshTokenSchema.index({ adminId: 1 });

export const AdminRefreshToken = mongoose.model<IAdminRefreshToken>(
  'AdminRefreshToken',
  adminRefreshTokenSchema
);
