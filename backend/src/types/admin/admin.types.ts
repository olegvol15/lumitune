import mongoose from 'mongoose';

export interface IAdmin extends mongoose.Document {
  email: string;
  password: string;
  resetCodeHash?: string;
  resetCodeExpiresAt?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}
