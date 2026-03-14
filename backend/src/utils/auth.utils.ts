import { AuthUserResponse } from '../types/auth/auth-service.types';

export const toAuthUserResponse = (user: {
  _id: unknown;
  email: string;
  username: string;
  displayName: string;
  dateOfBirth: { day: number; month: number; year: number };
  country: string;
  city: string;
  role: 'user' | 'creator';
  profilePicture?: string;
}): AuthUserResponse => ({
  id: String(user._id),
  email: user.email,
  username: user.username,
  displayName: user.displayName,
  dateOfBirth: user.dateOfBirth,
  country: user.country,
  city: user.city,
  role: user.role,
  profilePicture: user.profilePicture,
});