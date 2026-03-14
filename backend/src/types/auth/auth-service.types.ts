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

export interface AuthUserResponse {
  id: string;
  email: string;
  username: string;
  displayName: string;
  dateOfBirth: {
    day: number;
    month: number;
    year: number;
  };
  country: string;
  city: string;
  role: 'user' | 'creator';
  profilePicture?: string;
}

export interface AuthLoginResult {
  token: string;
  refreshToken: string;
  user: AuthUserResponse;
}

export interface AuthMeResult {
  user: IUser;
}