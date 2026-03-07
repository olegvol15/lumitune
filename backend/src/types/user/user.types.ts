import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  email: string;
  password: string;
  username: string;
  profilePicture?: string;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}
