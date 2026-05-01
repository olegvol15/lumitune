import { IUser } from '../user/user.types';

export interface RegisterUserInput {
  email?: string;
  password?: string;
  username?: string;
  displayName?: string;
  dateOfBirth?: {
    day?: number;
    month?: number;
    year?: number;
  };
  country?: string;
  city?: string;
  role?: 'user' | 'creator';
}

export interface LoginUserInput {
  email?: string;
  password?: string;
}

export interface UpdateUserProfileInput {
  displayName?: string;
  bio?: string;
  profilePicture?: string;
  coverImage?: string;
  role?: 'user' | 'creator';
}

export interface AuthUserResponse {
  id: string;
  email: string;
  username: string;
  displayName: string;
  dateOfBirth?: {          // optional — OAuth users may not have this
    day: number;
    month: number;
    year: number;
  };
  country?: string;        // optional — OAuth users may not have this
  city?: string;           // optional — OAuth users may not have this
  role: 'user' | 'creator';
  bio?: string;
  coverImage?: string;
  profilePicture?: string;
}

export interface AuthLoginResult {
  accessToken: string;
  user: AuthUserResponse;
}

export interface AuthMeResult {
  user: IUser;
}
