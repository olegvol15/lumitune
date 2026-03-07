import { AuthUserResponse } from '../types/auth/auth-service.types';

export const toAuthUserResponse = (user: {
  _id: unknown;
  email: string;
  username: string;
  profilePicture?: string;
}): AuthUserResponse => ({
  id: String(user._id),
  email: user.email,
  username: user.username,
  profilePicture: user.profilePicture,
});
