import { AuthUserResponse } from '../types/auth/auth-service.types';

export const toAuthUserResponse = (user: {
  _id: unknown;
  email: string;
  username: string;
  displayName: string;
  dateOfBirth?: { day: number; month: number; year: number };
  country?: string;
  city?: string;
  role: 'user' | 'creator';
  bio?: string;
  coverImage?: string;
  profilePicture?: string;
}): AuthUserResponse => ({
  id: String(user._id),
  email: user.email,
  username: user.username,
  displayName: user.displayName,
  dateOfBirth: user.dateOfBirth ?? { day: 0, month: 0, year: 0 },
  country: user.country ?? '',
  city: user.city ?? '',
  role: user.role,
  bio: user.bio,
  coverImage: user.coverImage,
  profilePicture: user.profilePicture,
});