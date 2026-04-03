import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types/user/user.types';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
  },
  displayName: {
    type: String,
    required: [true, 'Display name is required'],
    trim: true,
    minlength: [1, 'Display name cannot be empty'],
    maxlength: [50, 'Display name cannot exceed 50 characters'],
  },
  dateOfBirth: {
    day: {
      type: Number,
      min: [1, 'Day must be between 1 and 31'],
      max: [31, 'Day must be between 1 and 31'],
    },
    month: {
      type: Number,
      min: [1, 'Month must be between 1 and 12'],
      max: [12, 'Month must be between 1 and 12'],
    },
    year: {
      type: Number,
      min: [1900, 'Invalid year'],
      max: [new Date().getFullYear(), 'Year cannot be in the future'],
    },
  },
  country: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    enum: ['user', 'creator'],
    default: 'user',
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [600, 'Bio cannot exceed 600 characters'],
    default: '',
  },
  coverImage: {
    type: String,
    default: '',
  },
  profilePicture: {
    type: String,
    default: 'default-avatar.png',
  },

  oauthProvider: {
    type: String,
    enum: ['google', 'apple', 'facebook'],
    select: false,
  },
  oauthId: {
    type: String,
    select: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre('save', async function () {
  try {
    if (this.isModified('password') && this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  } catch (error) {
    throw error;
  }
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);