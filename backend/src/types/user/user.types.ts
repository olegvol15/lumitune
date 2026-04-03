import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  email: string;
  password?: string;
  username: string;
  displayName: string;
  dateOfBirth?: {
    day: number;
    month: number;
    year: number;
  };
  country?: string;
  city?: string;
  role: 'user' | 'creator';
  bio?: string;
  coverImage?: string;
  profilePicture?: string;
  oauthProvider?: 'google' | 'apple' | 'facebook';
  oauthId?: string;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}