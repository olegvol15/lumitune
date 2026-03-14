import { z } from 'zod';

// ─── Auth ──────────────────────────────────────────────────────────────────

const currentYear = new Date().getFullYear();

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(50, 'Display name cannot exceed 50 characters'),
  dateOfBirth: z.object({
    day: z.number().int().min(1, 'Day must be between 1 and 31').max(31, 'Day must be between 1 and 31'),
    month: z.number().int().min(1, 'Month must be between 1 and 12').max(12, 'Month must be between 1 and 12'),
    year: z.number().int().min(1900, 'Invalid year').max(currentYear, 'Year cannot be in the future'),
  }),
  country: z.string().min(1, 'Country is required').max(100),
  city: z.string().min(1, 'City is required').max(100),
  role: z.enum(['user', 'creator'], { message: 'Role must be user or creator' }),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const verifyResetCodeSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6, 'Reset code must be 6 digits'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6, 'Reset code must be 6 digits'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

// ─── Admin Auth ────────────────────────────────────────────────────────────

export const adminCredentialsSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const adminForgotPasswordSchema = forgotPasswordSchema;
export const adminVerifyResetCodeSchema = verifyResetCodeSchema;
export const adminResetPasswordSchema = resetPasswordSchema;

// ─── Song ──────────────────────────────────────────────────────────────────

export const songUploadBodySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  artist: z.string().min(1).max(200).optional(),
  album: z.string().max(200).optional(),
  genre: z.string().max(100).optional(),
});

export const songUpdateSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').max(200).optional(),
  artist: z.string().min(1, 'Artist cannot be empty').max(200).optional(),
  album: z.string().max(200).optional(),
  genre: z.string().max(100).optional(),
});

export const songQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().max(200).optional(),
  genre: z.string().max(100).optional(),
});

// ─── Playlist ──────────────────────────────────────────────────────────────

export const playlistCreateSchema = z.object({
  name: z.string().min(1, 'Playlist name is required').max(100),
  description: z.string().max(500).optional(),
  coverImage: z.string().url().optional(),
  isPublic: z.boolean().optional(),
});

export const playlistUpdateSchema = z.object({
  name: z.string().min(1, 'Playlist name cannot be empty').max(100).optional(),
  description: z.string().max(500).optional(),
  coverImage: z.string().url().optional(),
  isPublic: z.boolean().optional(),
});

export const addSongToPlaylistSchema = z.object({
  songId: z.string().min(1, 'songId is required'),
});

// ─── Refresh Token ─────────────────────────────────────────────────────────

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'refreshToken is required'),
});